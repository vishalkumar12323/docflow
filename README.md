# DocFlow

A modern PDF management application built with Next.js 16, Tailwind CSS 4, and TypeScript. DocFlow provides a seamless experience for managing your PDF documents with features like merging, splitting, and rotating.

## Features

- **Merge PDFs**: Combine multiple PDF files into a single document.
- **Split PDFs**: Extract specific pages or split a PDF into multiple files.
- **Rotate PDFs**: Rotate specific pages or the entire document to the desired orientation.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **PDF Processing**:
  - [`pdf-lib`](https://github.com/Hopding/pdf-lib)
  - [`react-pdf`](https://github.com/wojtekmaj/react-pdf)
- **Icons**: [Lucide React](https://lucide.dev/)

## How to Use

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd docflow/apps/web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To build the application for production:

```bash
npm run build
```

### Linting

To run the linter:

```bash
npm run lint
```
