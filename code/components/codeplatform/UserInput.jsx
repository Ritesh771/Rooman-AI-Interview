import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserInput = ({ setUserID, setRoomID }) => {
    const [inputValue, setInputValue] = useState("");
    const [roomID, setInputRoomID] = useState("");

    // Get the roomID from the URL on the first render
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            setInputRoomID(params.get("roomId")?.toString() || "");
        }
    }, []);

    const generateSimpleId = () => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const length = 4;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const handleGenerateRoomID = () => {
        const newRoomID = generateSimpleId();
        setInputRoomID(newRoomID);
        setRoomID(newRoomID);
    };

    const handleSubmit = () => {
        setUserID(inputValue);
        setRoomID(roomID);
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-gray-800 rounded-lg">
            <div className="flex flex-col gap-4">
                <h2 style={{ color: "white", fontSize: 24, marginBottom: 24 }}>Live Code Interviewer</h2>
                <Input
                    type="text"
                    placeholder="Name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="p-2 rounded border border-gray-300"
                />
                <Input
                    type="text"
                    placeholder="Unique Room ID"
                    value={roomID}
                    onChange={(e) => setInputRoomID(e.target.value)}
                    className="p-2 rounded border border-gray-300"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white">
                    Start
                </Button>
                <Button onClick={handleGenerateRoomID} className="bg-gray-500 hover:bg-gray-600 text-white">
                    Generate Room ID
                </Button>
                <Button
                    onClick={() => {
                        // window.location.href = `/interviewReport/index.html?roomId=${roomID}`;
                        alert("Interview Report not yet implemented");
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                    Interview Reports
                </Button>
            </div>
        </div>
    );
};

export default UserInput;