import { NextApiRequest, NextApiResponse } from 'next';
import { SocketHandler } from '@/lib/socket-server';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  return SocketHandler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
