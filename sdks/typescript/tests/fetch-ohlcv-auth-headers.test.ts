import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { Polymarket } from '../index';

function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
}

describe('SDK generated client header merging', () => {
    let server: Server;
    let baseUrl: string;

    beforeEach(async () => {
        server = createServer(async (req, res) => {
            if (req.method === 'GET' && req.url === '/health') {
                sendJson(res, 200, { status: 'ok' });
                return;
            }

            if (req.method === 'POST' && req.url === '/api/polymarket/fetchOHLCV') {
                if (req.headers['x-test-auth'] !== '1') {
                    sendJson(res, 401, {
                        success: false,
                        error: { message: 'Missing auth header' },
                    });
                    return;
                }

                const contentType = req.headers['content-type'];
                if (!contentType || !contentType.includes('application/json')) {
                    sendJson(res, 415, {
                        success: false,
                        error: { message: 'Missing JSON content type' },
                    });
                    return;
                }

                const body = JSON.parse(await readBody(req));
                expect(body).toEqual({
                    args: ['outcome-1', { resolution: '1d', limit: 1 }],
                });

                sendJson(res, 200, {
                    success: true,
                    data: [{
                        timestamp: 1,
                        open: 2,
                        high: 3,
                        low: 1,
                        close: 2.5,
                        volume: 4,
                    }],
                });
                return;
            }

            sendJson(res, 404, {
                success: false,
                error: { message: `Unhandled route: ${req.method} ${req.url}` },
            });
        });

        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', () => resolve());
        });
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterEach(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    });

    test('fetchOHLCV preserves JSON content-type when auth headers are added', async () => {
        const client = new Polymarket({
            baseUrl,
            autoStartServer: false,
        }) as any;

        client.initPromise = Promise.resolve();
        client.getAuthHeaders = () => ({ 'x-test-auth': '1' });

        const candles = await client.fetchOHLCV('outcome-1', {
            resolution: '1d',
            limit: 1,
        });

        expect(candles).toEqual([{
            timestamp: 1,
            open: 2,
            high: 3,
            low: 1,
            close: 2.5,
            volume: 4,
        }]);
    });
});
