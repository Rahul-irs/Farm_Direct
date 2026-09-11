import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPayments } from '../../services/api';
export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    useEffect(() => { getPayments().then((result) => setPayments(result.items)).catch(() => undefined); }, []);
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-3xl"><Link className="text-sm text-emerald-200" to="/dashboard/consumer">Dashboard</Link><h1 className="mt-6 text-4xl font-black">Payment history</h1><div className="mt-6 space-y-3">{payments.map((payment) => <article className="card flex flex-wrap justify-between gap-4 p-5" key={payment.id}><div><h2 className="font-semibold">Order #{payment.order_id}</h2><p className="mt-1 text-sm text-emerald-50/65">{payment.transaction_reference} · {payment.provider}</p></div><div className="text-right"><p className="font-bold text-emerald-200">₹{payment.amount.toFixed(2)}</p><p className="text-sm text-emerald-50/65">{payment.status}</p></div></article>)}{payments.length === 0 && <p className="card p-6 text-emerald-50/65">No payments yet.</p>}</div></div></main>;
}
