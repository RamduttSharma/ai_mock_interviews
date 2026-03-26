"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResumeUpload({ userId }: { userId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please upload a resume first");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", userId);

            const res = await fetch("/api/resume/analyze", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            // ✅ Redirect to interview page
            if (data.interviewId) {
                router.push(`/interview/${data.interviewId}`);
            } else {
                router.refresh();
            }

        } catch (err: any) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-2xl p-6 flex flex-col gap-4 bg-transparent shadow-sm">
            <h2 className="text-lg font-semibold">Upload Resume</h2>

            <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <Button style={{background:"rgb(214, 213, 237)", border:"1px solid gray", color:"rgb(8, 5, 94)"}} onClick={handleUpload} disabled={loading}>
                {loading ? "Generating..." : "Generate Interview from Resume"}
            </Button>
        </div>
    );
} 