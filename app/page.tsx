import EmailForm from "@/components/email-form"
import Footer from "@/components/footer"
import Header from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create Cold Emails</h1>
          <EmailForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}

