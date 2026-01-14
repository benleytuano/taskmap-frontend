import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found."
}) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left overflow-hidden"
        >
          <span className="truncate">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col">
          <div className="border-b p-2">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option}-${index}`}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "relative flex items-center rounded-sm px-2 py-1.5 text-sm cursor-pointer select-none hover:bg-gray-100 text-gray-900",
                    value === option && "bg-gray-100"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1">{option}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
