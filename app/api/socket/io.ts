import { NextApiRequest, NextApiResponse } from 'next';
import SocketHandler from '@/lib/socket-server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return SocketHandler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
