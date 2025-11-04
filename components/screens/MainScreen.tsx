// MainScreen.tsx
import { GeminiResponse, Question } from "@/types/response.types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MainScreen() {
  const [textInput, setTextInput] = useState(
    "List of questions about general knowledge of Colombia."
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIresponse();
  }, []);

  const getAIresponse = async () => {
    const body = {
      contents: [
        {
          parts: [
            {
              text: textInput,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              correctOption: {
                type: "NUMBER",
              },
            },
            propertyOrdering: ["question", "options"],
          },
        },
      },
    };

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data: GeminiResponse = await response.json();

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      const parsed: Question[] = JSON.parse(text);

      setQuestions(parsed);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching Gemini data:", error);
      setLoading(false);
    }
  };

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (submitted) return;
    setSelectedOptions((prev) => ({
      ...prev,
      [qIndex]: oIndex,
    }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (selectedOptions[i] === q.correctOption) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading questions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
        General Knowledge Quiz: Colombia 🇨🇴
      </Text>

      {questions.map((q, qIndex) => (
        <View
          key={qIndex}
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            {qIndex + 1}. {q.question}
          </Text>

          {q.options.map((option, oIndex) => {
            const isSelected = selectedOptions[qIndex] === oIndex;
            const isCorrect = q.correctOption === oIndex;
            let bgColor = "#e0e0e0";

            if (submitted) {
              if (isCorrect) bgColor = "#4caf50"; // green
              else if (isSelected && !isCorrect) bgColor = "#f44336"; // red
              else bgColor = "#e0e0e0";
            } else if (isSelected) {
              bgColor = "#2196f3"; // blue
            }

            return (
              <TouchableOpacity
                key={oIndex}
                onPress={() => handleSelect(qIndex, oIndex)}
                style={{
                  backgroundColor: bgColor,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "#fff" }}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {!submitted ? (
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: "#673ab7",
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Submit Answers</Text>
        </TouchableOpacity>
      ) : (
        <View
          style={{
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Score: {score} / {questions.length}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
