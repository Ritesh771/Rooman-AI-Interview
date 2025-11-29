import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Code, ChevronDown } from "lucide-react";
import { LANGUAGE_VERSIONS } from "@/code/utils/codeplatform/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({
    language,
    onSelect,
}) => {
    const getLanguageIcon = (lang) => {
        const icons = {
            javascript: "1",
            python: "2",
            java: "3",
            cplusplus: "4"
        };
        return icons[lang] || "💻";
    };

    const getLanguageDisplayName = (lang) => {
        const names = {
            javascript: "JavaScript",
            python: "Python",
            java: "Java",
            cplusplus: "C++"
        };
        return names[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Code className="w-4 h-4" />
                <span>Language:</span>
            </div>
            <Select value={language} onValueChange={onSelect}>
                <SelectTrigger className="w-[180px] bg-white border-2 hover:border-blue-300 focus:border-blue-500 transition-colors">
                    <SelectValue>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{getLanguageIcon(language)}</span>
                            <span className="font-medium">{getLanguageDisplayName(language)}</span>
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-2">
                    {languages.map(([lang, version]) => (
                        <SelectItem
                            key={lang}
                            value={lang}
                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 py-3"
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getLanguageIcon(lang)}</span>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{getLanguageDisplayName(lang)}</span>
                                        <span className="text-xs text-gray-500">v{version}</span>
                                    </div>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default LanguageSelector;