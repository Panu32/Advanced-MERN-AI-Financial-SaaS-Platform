import { useState, useRef, useEffect } from "react"
import { ChevronDown, LogOut } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar"
import { Button } from "../ui/button"

export function UserNav({
  userName,
  profilePicture,
  onLogout,
}: {
  userName: string;
  profilePicture: string;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="relative !bg-transparent h-auto w-auto rounded-full gap-2 px-1 z-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={profilePicture || ""} />
          <AvatarFallback
            className="!bg-[var(--secondary-dark-color)] border !border-gray-700 !text-white"
          >
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="w-4 h-4 text-white" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-[999] py-1 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="font-semibold text-sm text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 font-light mt-0.5">Free Trial (2 days left)</p>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center px-2 py-2 text-sm text-gray-700 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
