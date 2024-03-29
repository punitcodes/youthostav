import { getServerSession } from "next-auth/next";
import prisma from "libs/prisma";

import type { NextApiRequest, NextApiResponse } from "next";
import { Points } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth].api";

export default async function createPoints(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { mandalId, sabhaId, points } = req.body as {
    mandalId: number;
    sabhaId: number;
    points: { new?: Points[]; existing?: Points[] };
  };

  const session = await getServerSession(req, res, authOptions);

  try {
    if (session) {
      if (!!points?.new) {
        await prisma.points.createMany({
          data: points.new.map(
            ({ name, value, type, teamId = null, yuvakId = null }) => ({
              name,
              value,
              type,
              mandalId,
              sabhaId,
              teamId,
              yuvakId,
            })
          ),
        });
      }

      if (!!points?.existing) {
        points.existing.forEach(async ({ id, value }) => {
          await prisma.points.update({
            where: { id },
            data: { value },
          });
        });
      }

      res.json({ ok: true });
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).send({ message: "Something went wrong" });
  }
}
