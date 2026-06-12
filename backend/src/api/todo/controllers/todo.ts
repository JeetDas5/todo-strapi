import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::todo.todo",
  ({ strapi }) => ({
    async myTodos(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const todos = await strapi.documents("api::todo.todo").findMany({
        filters: {
          user: {
            documentId: {
              $eq: user.documentId,
            },
          },
        },
      });

      return todos;
    },

    async createMyTodo(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized();
      }

      const body = ctx.request.body;
      const data = body.data || body;

      const todo = await strapi.documents("api::todo.todo").create({
        data: {
          title: data.title,
          completed: false,
          user: user.documentId,
        },
      });

      return todo;
    },

    async find(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const query = ctx.query as any;
      query.filters = {
        ...(query.filters || {}),
        user: {
          documentId: {
            $eq: user.documentId,
          },
        },
      };

      const { results, pagination } = await strapi
        .service("api::todo.todo")
        .find(query);
      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      return this.transformResponse(sanitizedResults, { pagination });
    },

    async findOne(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const documentId = ctx.params.id;

      const todo = await strapi.documents("api::todo.todo").findOne({
        documentId,
        populate: ["user"],
      });

      if (!todo) {
        return ctx.notFound();
      }

      if (todo.user && todo.user.documentId !== user.documentId) {
        return ctx.forbidden("You do not own this todo");
      }

      const { data, meta } = await super.findOne(ctx);
      return { data, meta };
    },

    async create(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const body = ctx.request.body;
      if (!body || typeof body.data !== "object") {
        return ctx.badRequest('Missing "data" payload in request body');
      }

      const sanitizedInputData = (await this.sanitizeInput(
        body.data,
        ctx,
      )) as any;

      const entity = await strapi.service("api::todo.todo").create({
        data: {
          ...sanitizedInputData,
          user: user.documentId,
        },
      });

      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      ctx.status = 201;
      return this.transformResponse(sanitizedEntity);
    },

    async update(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const documentId = ctx.params.id;

      const todo = await strapi.documents("api::todo.todo").findOne({
        documentId,
        populate: ["user"],
      });

      if (!todo) {
        return ctx.notFound();
      }

      if (todo.user && todo.user.documentId !== user.documentId) {
        return ctx.forbidden("You do not own this todo");
      }

      if (ctx.request.body.data) {
        delete ctx.request.body.data.user;
      }

      const { data, meta } = await super.update(ctx);
      return { data, meta };
    },

    async delete(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      const documentId = ctx.params.id;

      const todo = await strapi.documents("api::todo.todo").findOne({
        documentId,
        populate: ["user"],
      });

      if (!todo) {
        return ctx.notFound();
      }

      if (todo.user && todo.user.documentId !== user.documentId) {
        return ctx.forbidden("You do not own this todo");
      }

      return await super.delete(ctx);
    },
  }),
);
