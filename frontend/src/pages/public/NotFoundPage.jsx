export default function NotFoundPage() {
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-md p-8 text-center">
        <h1 className="text-5xl font-black">404</h1>
        <p className="mt-3 text-lg text-emerald-50/80">This page is not available.</p>
        <a href="/" className="btn-primary mt-6">Back home</a>
      </div>
    </div>);
}
