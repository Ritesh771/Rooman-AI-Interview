import { Button } from "@/components/ui/button";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar";
import clsx from "clsx";
import { LANGUAGE_VERSIONS } from "@/code/utils/codeplatform/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR_CLASS = "text-blue-500";

const LanguageSelector = ({
    language,
    onSelect,
}) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Language:</span>
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger asChild>
                        <Button variant="outline" size="sm" className="capitalize">
                            {language}
                        </Button>
                    </MenubarTrigger>
                    <MenubarContent className="bg-background">
                        {languages.map(([lang, version]) => (
                            <MenubarItem
                                key={lang}
                                className={clsx(
                                    "flex w-full items-center justify-between",
                                    lang === language && `${ACTIVE_COLOR_CLASS} font-semibold`
                                )}
                                onClick={() => onSelect(lang)}
                            >
                                <span className="capitalize">{lang}</span>
                                <span className="ml-2 text-xs text-gray-500">
                                    {version}
                                </span>
                            </MenubarItem>
                        ))}
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    );
};

export default LanguageSelector;