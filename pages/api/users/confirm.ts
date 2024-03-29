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
          auth: true,
        },
      },
    },
  });
  if (!foundToken)
    return res.status(404).json({
      ok: false,
      error: "The code is incorrect. Please try again.",
    });

  // req.session.user = {
  //   id: foundToken.userId,
  //   setup: foundToken.user.setup || false,
  //   auth: true,
  // };

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

  const authUser = await db.user.update({
    where: {
      id: req.session.user.id,
    },
    data: {
      auth: true,
    },
  });

  res.json({ ok: true, authUser });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
