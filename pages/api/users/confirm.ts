import db from "@/lib/db";
import withHandler, { ResponseType } from "@/lib/withHandler";
import { NextApiRequest, NextApiResponse } from "next";
import { withApiSession } from "@/lib/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body;
  const foundToken = await db.token.findUnique({
    where: {
      payload: token,
    },
    include: {
      user: {
        select: {
          id: true,
          setup: true,
        },
      },
    },
  });
  if (!foundToken)
    return res.status(404).json({
      ok: false,
      error: "The token is incorrect. Please try again.",
    });

  req.session.user = {
    id: foundToken.userId,
    setup: foundToken.user.setup || false,
  };

  await req.session.save();

  await db.token.deleteMany({
    where: {
      userId: foundToken.userId,
    },
  });
  res.json({ ok: true });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
