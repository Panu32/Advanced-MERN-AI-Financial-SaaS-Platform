import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from pydantic import BaseModel, Field

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.documents import Document

from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("[PythonService] WARNING: MONGO_URI is not set in environment variables.")

client = MongoClient(MONGO_URI)
print("[PythonService] Connected to MongoDB Atlas")

try:
    db = client.get_default_database()
except Exception:
    # Mongoose uses "test" by default if no database name is specified in the URI
    db = client["test"]
    
transactions_collection = db["transactions"]

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    max_output_tokens=2048,
    api_key=os.getenv("GEMINI_API_KEY")
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    api_key=os.getenv("GEMINI_API_KEY")
)

class FilterSchema(BaseModel):
    start_date: Optional[str] = Field(description="Start date in YYYY-MM-DD format if mentioned in query", default=None)
    end_date: Optional[str] = Field(description="End date in YYYY-MM-DD format if mentioned in query", default=None)
    category: Optional[str] = Field(description="The transaction category if mentioned (e.g., GROCERY, RENT, ENTERTAINMENT, UTILITIES)", default=None)
    is_aggregation: bool = Field(description="True if asking for summary/total/count, false if asking for specific details about individual transactions")
    is_finance_query: bool = Field(description="True if related to finance, personal budgeting, or transactions. False otherwise.")

async def process_chat(user_id: str, chat_history: List[Dict[str, str]], message: str) -> str:
    # 1. Analyze Query
    extractor = llm.with_structured_output(FilterSchema)
    
    messages = []
    for h in chat_history:
        if h.get("role") == "user":
            messages.append(HumanMessage(content=h.get("content", "")))
        else:
            messages.append(AIMessage(content=h.get("content", "")))
    messages.append(HumanMessage(content=f"Extract filters from this query: {message}"))
    
    try:
        analysis = await extractor.ainvoke(messages)
    except Exception as e:
        print("Extractor Error:", e)
        # Fallback if structured output fails
        analysis = FilterSchema(is_finance_query=True, is_aggregation=False)
    
    if not getattr(analysis, "is_finance_query", True):
        return "I am a financial advisor assistant. I can only answer questions related to your personal finances and transactions."
        
    # 2. Build MongoDB Query
    query: Dict[str, Any] = { "userId": ObjectId(user_id) }
    
    start_str = getattr(analysis, "start_date", None)
    end_str = getattr(analysis, "end_date", None)
    
    if start_str or end_str:
        query["date"] = {}
        if start_str:
            try:
                query["date"]["$gte"] = datetime.fromisoformat(start_str)
            except Exception:
                pass
        if end_str:
            try:
                end = datetime.fromisoformat(end_str).replace(hour=23, minute=59, second=59, microsecond=999000)
                query["date"]["$lte"] = end
            except Exception:
                pass
            
    cat = getattr(analysis, "category", None)
    if cat:
        query["category"] = { "$regex": f"^{cat}$", "$options": "i" }
        
    # 3. Fetch Transactions
    cursor = transactions_collection.find(query).sort("date", -1)
    transactions = list(cursor)
    
    context_content = "No specific transactions found for this query."
    
    if len(transactions) > 0:
        if getattr(analysis, "is_aggregation", False) or len(transactions) <= 15:
            # Bypass vector search
            formatted_txs = []
            for t in transactions:
                formatted_txs.append({
                    "title": t.get("title"),
                    "amount": t.get("amount", 0) / 100.0,
                    "date": t.get("date", datetime.now()).isoformat() if isinstance(t.get("date"), datetime) else str(t.get("date")),
                    "category": t.get("category"),
                    "type": t.get("type", "")
                })
            import json
            context_content = json.dumps(formatted_txs)
        else:
            # FAISS Vector Search
            docs = []
            for t in transactions:
                amount_dollars = t.get("amount", 0) / 100.0
                desc = t.get("description", "None")
                cat = t.get("category", "")
                dt = getattr(t.get("date"), "strftime", lambda x: str(t.get("date")))("%Y-%m-%d")
                text = f"Transaction: {t.get('title')}. Description: {desc}. Amount: ${amount_dollars:.2f}. Category: {cat}. Date: {dt}"
                docs.append(Document(page_content=text, metadata={"id": str(t["_id"])}))
                
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            split_docs = splitter.split_documents(docs)
            
            vectorstore = await FAISS.afrom_documents(split_docs, embeddings)
            retriever = vectorstore.as_retriever(search_kwargs={"k": 15})
            relevant_docs = await retriever.ainvoke(message)
            
            context_content = "\n".join([d.page_content for d in relevant_docs])
            
    # 5. Generate final response
    prompt_raw = """
    You are a helpful financial advisor assistant. Use the following transaction history context to explicitly ground your answers when discussing the user's specific history.
    If the user asks a general finance question (e.g. "How can I save money?"), answer using your general financial knowledge while remaining strictly within the persona of a financial advisor.
    If the user explicitly asks about their specific transaction history and the context doesn't contain the answer, politely say "I don't have enough information about your transactions to answer that."
    Calculate totals explicitly if requested. Format monetary values dynamically based on amounts (e.g. $100.00).

    Context (Transaction Data):
    {context}

    Current Conversation History:
    {history}

    User Question: {question}
    
    Financial Advisor Response:
    """
    prompt = PromptTemplate.from_template(prompt_raw)
    
    history_text = "\n".join([f"{h.get('role', 'user')}: {h.get('content', '')}" for h in chat_history])
    if not history_text:
        history_text = "No previous history."
        
    chain = prompt | llm
    
    response = await chain.ainvoke({
        "context": context_content,
        "history": history_text,
        "question": message
    })
    
    return response.content

