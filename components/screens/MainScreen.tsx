import { GeminiResponse, Question } from '@/types/response.types';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function MainScreen() {
    const [textInput, setTextInput] = useState("List of questions about general knowledge of Colombia.")
    const [responseData, setResponseData] = useState<Question[]>([]);

    useEffect(() => {
        getAIresponse();
    }, []);

    const getAIresponse = async () => {
        const body = {
            "contents": [
            {
                "parts": [
                {
                    "text": textInput
                }
                ]
            }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                    "question": { "type": "STRING" },
                    "options": {
                        "type": "ARRAY",
                        "items": { "type": "STRING" }
                    },
                    "correctOption": {
                        "type": "NUMBER"
                    }
                    },
                    "propertyOrdering": ["question", "options"]
                }
                }
            }
        }
        
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
                method: "POST",
                headers: {
                    'x-goog-api-key': process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data: GeminiResponse = await response.json();

            const parsed = JSON.parse(data.candidates[0].content.parts[0].text)
            setResponseData(parsed)
 
            console.log(JSON.stringify(data, null, 2))
        } catch (error) {
            console.log(error)
        }
    }

    return (
      <View
        style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}
      >
        <Text></Text>
      </View>
    )
}