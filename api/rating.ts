import fetch from 'node-fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface UserRatingInfo {
    rating: number;
    text: string;
}

function escape(username: string) {
    return encodeURIComponent(username.replace(/-/g, '--').replace(/_/g, '__'));
}

function getRatingColor(rating: number) {
    if (rating >= 2400) return 'ff0000';
    if (rating >= 2100) return 'ff8c00';
    if (rating >= 1900) return 'aa00aa';
    if (rating >= 1600) return '0000ff';
    if (rating >= 1400) return '03a89e';
    if (rating >= 1200) return '008000';
    return '808080';
}

async function fetchData(username: string): Promise<UserRatingInfo> {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);

    if (!res.ok) return { rating: 0, text: 'N/A' };

    const data = await res.json();
    const { rank, rating } = data.result[0];
    const text = rank && rating ? `${rank}  ${rating}` : 'Unrated';

    return { rating, text };
}

async function getBadgeImage(username: string, data: UserRatingInfo, style: string) {
    const color = getRatingColor(data.rating);
    const escapedUsername = escape(username);
    const escapedRatingText = escape(data.text);

    const params = new URLSearchParams({
        longCache: 'true',
        style,
        logo: 'codeforces',
        link: `https://codeforces.com/profile/${username}`,
    });

    const res = await fetch(
        `https://img.shields.io/badge/${escapedUsername}-${escapedRatingText}-${color}.svg?${params.toString()}`
    );

    if (!res.ok) throw 'error';
    return await res.text();
}

export default async (request: VercelRequest, response: VercelResponse) => {
    let { username = 'baoshuo', style = 'for-the-badge' } = request.query;

    if (Array.isArray(username)) username = username[0];
    if (Array.isArray(style)) style = style[0];

    const data = await fetchData(username as string).catch(() => ({ rating: 0, text: 'N/A' }));
    getBadgeImage(username as string, data, style as string)
        .then((data) => {
            response.status(200).setHeader('Content-Type', 'image/svg+xml;charset=utf-8').send(data);
        })
        .catch(() => {
            response.status(500).send('error');
        });
};
