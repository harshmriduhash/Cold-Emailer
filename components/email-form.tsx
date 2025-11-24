"use client";

import type React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Person {
  id: string;
  name: string;
  email: string;
}

export default function EmailForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    companyName: "",
    people: [{ id: crypto.randomUUID(), name: "", email: "" }] as Person[],
  });

  const [errors, setErrors] = useState<{
    jobTitle?: string;
    jobDescription?: string;
    companyName?: string;
    people?: { [key: string]: { name?: string; email?: string } };
  }>({});

  const addPerson = () => {
    setFormData({
      ...formData,
      people: [
        ...formData.people,
        { id: crypto.randomUUID(), name: "", email: "" },
      ],
    });
  };

  const removePerson = (id: string) => {
    if (formData.people.length === 1) {
      return; // Keep at least one person
    }
    setFormData({
      ...formData,
      people: formData.people.filter((person) => person.id !== id),
    });
  };

  const updatePerson = (id: string, field: "name" | "email", value: string) => {
    setFormData({
      ...formData,
      people: formData.people.map((person) =>
        person.id === id ? { ...person, [field]: value } : person
      ),
    });

    // Clear error when typing
    if (errors.people && errors.people[id] && errors.people[id][field]) {
      const newErrors = { ...errors };
      if (newErrors.people && newErrors.people[id]) {
        delete newErrors.people[id][field];
      }
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: {
      jobTitle?: string;
      jobDescription?: string;
      companyName?: string;
      people?: { [key: string]: { name?: string; email?: string } };
    } = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    const peopleErrors: { [key: string]: { name?: string; email?: string } } =
      {};
    let hasPeopleErrors = false;

    formData.people.forEach((person) => {
      const personErrors: { name?: string; email?: string } = {};

      if (!person.name.trim()) {
        personErrors.name = "Name is required";
        hasPeopleErrors = true;
      }

      if (!person.email.trim()) {
        personErrors.email = "Email is required";
        hasPeopleErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
        personErrors.email = "Valid email is required";
        hasPeopleErrors = true;
      }

      if (Object.keys(personErrors).length > 0) {
        peopleErrors[person.id] = personErrors;
      }
    });

    if (hasPeopleErrors) {
      newErrors.people = peopleErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://swapnil11.app.n8n.cloud/webhook-test/cold-email-hook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Cold emails have been sent successfully",
        });

        // Reset form
        setFormData({
          jobTitle: "",
          jobDescription: "",
          companyName: "",
          people: [{ id: crypto.randomUUID(), name: "", email: "" }],
        });
      } else {
        throw new Error("Failed to send emails");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => {
              setFormData({ ...formData, jobTitle: e.target.value });
              if (errors.jobTitle) {
                setErrors({ ...errors, jobTitle: undefined });
              }
            }}
            className={errors.jobTitle ? "border-destructive" : ""}
          />
          {errors.jobTitle && (
            <p className="text-destructive text-sm mt-1">{errors.jobTitle}</p>
          )}
        </div>

        <div>
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={(e) => {
              setFormData({ ...formData, jobDescription: e.target.value });
              if (errors.jobDescription) {
                setErrors({ ...errors, jobDescription: undefined });
              }
            }}
            className={`min-h-32 ${
              errors.jobDescription ? "border-destructive" : ""
            }`}
          />
          {errors.jobDescription && (
            <p className="text-destructive text-sm mt-1">
              {errors.jobDescription}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => {
              setFormData({ ...formData, companyName: e.target.value });
              if (errors.companyName) {
                setErrors({ ...errors, companyName: undefined });
              }
            }}
            className={errors.companyName ? "border-destructive" : ""}
          />
          {errors.companyName && (
            <p className="text-destructive text-sm mt-1">
              {errors.companyName}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>People</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPerson}
            >
              Add Person
            </Button>
          </div>

          <div className="space-y-3">
            {formData.people.map((person) => (
              <Card key={person.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Person Details</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePerson(person.id)}
                        disabled={formData.people.length === 1}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`name-${person.id}`}>Name</Label>
                        <Input
                          id={`name-${person.id}`}
                          value={person.name}
                          onChange={(e) =>
                            updatePerson(person.id, "name", e.target.value)
                          }
                          className={
                            errors.people &&
                            errors.people[person.id] &&
                            errors.people[person.id].name
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {errors.people &&
                          errors.people[person.id] &&
                          errors.people[person.id].name && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.people[person.id].name}
                            </p>
                          )}
                      </div>

                      <div>
                        <Label htmlFor={`email-${person.id}`}>Email</Label>
                        <Input
                          id={`email-${person.id}`}
                          type="email"
                          value={person.email}
                          onChange={(e) =>
                            updatePerson(person.id, "email", e.target.value)
                          }
                          className={
                            errors.people &&
                            errors.people[person.id] &&
                            errors.people[person.id].email
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {errors.people &&
                          errors.people[person.id] &&
                          errors.people[person.id].email && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.people[person.id].email}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Emails"}
      </Button>
    </form>
  );
}
