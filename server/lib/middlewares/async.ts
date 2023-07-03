// SPDX-FileCopyrightText: 2023 Code Lutin SASPO  <https://www.codelutin.com/>
// SPDX-FileCopyrightText: 2023 John Livingston <https://www.john-livingston.fr/>
//
// SPDX-License-Identifier: AGPL-3.0-only

import { eachSeries } from 'async'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

// Syntactic sugar to avoid try/catch in express controllers
// Thanks: https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016

export type RequestPromiseHandler = ((req: Request, res: Response, next: NextFunction) => Promise<any>)

function asyncMiddleware (fun: RequestPromiseHandler | RequestPromiseHandler[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (Array.isArray(fun)) {
      eachSeries(fun as RequestHandler[], (f, cb) => {
        Promise.resolve(f(req, res, (err: any) => cb(err)))
          .catch(err => next(err))
      }, next)
      return
    }

    Promise.resolve((fun as RequestHandler)(req, res, next))
      .catch(err => next(err))
  }
}

export {
  asyncMiddleware
}
