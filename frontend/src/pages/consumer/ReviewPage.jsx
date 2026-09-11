import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createReview } from '../../services/api';
export default function ReviewPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const productId = Number(params.get('product'));
    const orderId = Number(params.get('order'));
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    async function submit(event) { event.preventDefault(); try {
        await createReview({ product_id: productId, order_id: orderId, rating, comment });
        navigate('/orders');
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to submit review');
    } }
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-xl"><Link className="text-sm text-emerald-200" to="/orders">Orders</Link><h1 className="mt-6 text-4xl font-black">Review your purchase</h1><form className="card mt-6 space-y-5 p-6" onSubmit={submit}><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Rating</span><select className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={rating} onChange={(event) => setRating(Number(event.target.value))}><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Bad</option></select></label><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Comment</span><textarea className="min-h-32 w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={comment} onChange={(event) => setComment(event.target.value)}/></label>{error && <p className="text-sm text-rose-300" role="alert">{error}</p>}<button className="btn-primary" type="submit">Submit review</button></form></div></main>;
}
