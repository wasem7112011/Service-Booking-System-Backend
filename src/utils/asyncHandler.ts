import { NextFunction, Request, Response } from "express";

type AsyncFn<Req = Request> = (req: Req, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler<Req = Request>(fn: AsyncFn<Req>) {
  return (req: Req, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
