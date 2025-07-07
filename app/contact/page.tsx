"use client"

import React, { useState } from "react"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    topic: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          topic: formData.topic,
          message: formData.message,
        }),
      })

      if (response.ok) {
        setSubmitMessage(
          "Thank you for your message! We will get back to you soon."
        )
        setFormData({ email: "", topic: "", message: "" })
      } else {
        setSubmitMessage("Error: Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error sending form:", error)
      setSubmitMessage("An unexpected error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      {submitMessage && (
        <div
          className={`p-4 mb-6 rounded ${submitMessage.includes("Error") ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"}`}
        >
          {submitMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-md font-medium text-foreground"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block h-8 p-2 w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-foreground"
          >
            Topic:
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="mt-1 block h-8 p-2 w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-foreground"
          >
            Message:
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  )
}

export default ContactPage
