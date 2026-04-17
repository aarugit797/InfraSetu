import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/hooks/useI18n";
import { Globe } from "lucide-react";
import type { LanguageCode } from "@/i18n/translations";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <Select
      value={language}
      onValueChange={(val) => setLanguage(val as LanguageCode)}
    >
      <SelectTrigger className="w-[130px] h-9 bg-white border-slate-200">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English (EN)</SelectItem>
        <SelectItem value="hi">हिंदी (HI)</SelectItem>
        <SelectItem value="mr">मराठी (MR)</SelectItem>
      </SelectContent>
    </Select>
  );
}
