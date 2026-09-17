import { ArrowLeft, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createReview } from '../../services/api';

const sampleImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

export default function ReviewPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const productId = Number(params.get('product'));
    const orderId = Number(params.get('order'));
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    async function submit(event) {
        event.preventDefault();
        try {
            await createReview({ product_id: productId, order_id: orderId, rating, comment });
            navigate('/orders');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to submit review');
        }
    }

    return (
        <main className="consumer-review-page">
            <div className="consumer-review-shell">
                <Link className="consumer-review-back" to="/orders">
                    <ArrowLeft size={15} />
                    Back to orders
                </Link>

                <section className="consumer-review-card">
                    <div className="consumer-review-product">
                        <img src={sampleImage} alt="Farm produce" />
                        <div className="consumer-review-product-copy">
                            <span>Fresh harvest</span>
                            <h1>How was your order?</h1>
                            <p>We’d love to hear about the quality, freshness, and delivery experience.</p>
                        </div>
                    </div>

                    <form className="consumer-review-form" onSubmit={submit}>
                        <div className="consumer-review-rating-wrap">
                            <span className="consumer-review-label">Your rating</span>
                            <div className="consumer-review-stars" aria-label="Rating picker">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={value <= rating ? 'is-active' : ''}
                                        onClick={() => setRating(value)}
                                        aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                                    >
                                        <Star size={18} fill="currentColor" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="consumer-review-field">
                            <span className="consumer-review-label">Review details</span>
                            <textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                placeholder="Share what stood out about the produce, packaging, and delivery experience..."
                            />
                        </label>

                        {error && (
                            <p className="consumer-review-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button type="submit" className="consumer-review-submit">
                            Submit review
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
