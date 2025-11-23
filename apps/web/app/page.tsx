import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Merge, Scissors, RotateCw, Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 md:p-24 gap-12 primary-background primary-foreground">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight ">
          Simplify Your PDF Workflow
        </h1>
        <p className="text-lg">
          The easiest way to merge, split, rotate, and manage your PDF files.
          Secure, fast, and free.
        </p>
      </div>

      {/* Upload Area Placeholder */}
      <Card className="w-full max-w-2xl border-dashed border-2 border-slate-300 cursor-pointer">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">Drop your PDF here</h3>
            <p className="text-sm mt-1">or click to browse files</p>
          </div>
          <Button className="mt-4">Select File</Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/merge">
          <FeatureCard
            icon={<Merge className="w-6 h-6" />}
            title="Merge PDFs"
            description="Combine multiple PDFs into a single file in seconds."
          />
        </Link>
        <Link href="/split">
          <FeatureCard
            icon={<Scissors className="w-6 h-6" />}
            title="Split PDF"
            description="Extract pages or split a document into multiple files."
          />
        </Link>
        <Link href="/rotate">
          <FeatureCard
            icon={<RotateCw className="w-6 h-6" />}
            title="Rotate PDF"
            description="Rotate specific pages or the entire document."
          />
        </Link>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="space-y-2">
        <div className="w-10 h-10 rounded-lg primary-background primary-foreground flex items-center justify-center ">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
