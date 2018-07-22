function registerRoutes(app, routes, registerMiddleware = []) {
  routes.forEach((route) => {
    const handlerMiddleware = route[2] || [];

    Object.keys(route[1]).forEach((g) => {
      app[g](route[0], [].concat(handlerMiddleware, registerMiddleware), route[1][g]);
    });
  });
}

export default registerRoutes;
