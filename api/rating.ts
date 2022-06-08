import fetch from 'node-fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';

function getRatingColor(rating: number) {
    if (rating >= 2400) return 'ff0000';
    if (rating >= 2100) return 'ff8c00';
    if (rating >= 1900) return 'aa00aa';
    if (rating >= 1600) return '0000ff';
    if (rating >= 1400) return '03a89e';
    if (rating >= 1200) return '008000';
    return '808080';
}

export default (request: VercelRequest, response: VercelResponse) => {
    const { username } = request.query;

    fetch(`https://codeforces.com/api/user.info?handles=${username}`)
        .then((res) => {
            if (!res.ok) throw '';
            return res.json();
        })
        .then((res) => {
            if (!res.result.length) throw '';

            const { rank, rating } = res.result[0];
            const color = getRatingColor(rating);
            const escapedUsername = (username as string).replace(/-/g, '--').replace(/_/g, '__');

            fetch(
                `https://img.shields.io/badge/${escapedUsername}-${rank && rating ? `${rank}  ${rating}` : 'Unrated'}-${color}.svg?longCache=true&style=for-the-badge&link=https://codeforces.com/profile/${username}&logo=codeforces`
            )
                .then((res) => {
                    if (!res.ok) throw '';
                    return res.text();
                })
                .then((res) => {
                    response.status(200).setHeader('Content-Type', 'image/svg+xml;charset=utf-8').send(res);
                })
                .catch((err) => {
                    response.status(500).send('Error!\n' + err);
                });
        })
        .catch((err) => {
            response.status(500).send('Error!\n' + err);
        });
};
