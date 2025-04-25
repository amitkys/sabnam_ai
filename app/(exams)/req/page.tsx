// src/pages/req.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentLayout } from "@/components/admin-panel/content-layout";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function RequestExamPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    examName: "",
    category: "",
    description: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Thank you! Your exam request has been submitted.");
      router.push("/");
    } catch (error) {
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContentLayout title="Request">
      <div className="flex flex-col items-center min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] mt-5">
        <motion.div
          animate="visible"
          className="container max-w-4xl"
          initial="hidden"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="text-foreground/75 relative px-4 py-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Link
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 group"
                    href="/exams"
                  >
                    <ArrowLeft className="h-4 md:h-5 transform transition-transform duration-200 group-hover:-translate-x-1" />
                  </Link>
                </div>

                <div className="flex flex-col w-full">
                  <CardTitle className="text-base md:text-xl font-bold">
                    Request an Exam Test
                  </CardTitle>
                </div>
              </CardHeader>

              <form className="text-foreground/75" onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label className="text-sm font-medium" htmlFor="examName">
                      Exam Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      id="examName"
                      name="examName"
                      placeholder="e.g., GATE Computer Science"
                      value={formData.examName}
                      onChange={handleChange}
                    />
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label className="text-sm font-medium" htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      required
                      value={formData.category}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="government">
                          Government Job
                        </SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label
                      className="text-sm font-medium"
                      htmlFor="description"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      required
                      className="min-h-32"
                      id="description"
                      name="description"
                      placeholder="Describe what you want related to exams"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </motion.div>
                </CardContent>

                <motion.div variants={itemVariants}>
                  <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button disabled={isSubmitting} type="submit">
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </CardFooter>
                </motion.div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ContentLayout>
  );
}
