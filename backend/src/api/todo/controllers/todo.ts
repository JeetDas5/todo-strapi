import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::todo.todo",
  ({ strapi }) => ({
    // Custom legacy controllers
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
      const data = body.data || body; // Support both nested { data: { title } } and flat { title }

      const todo = await strapi.documents("api::todo.todo").create({
        data: {
          title: data.title,
          completed: false,
          user: user.documentId,
        },
      });

      return todo;
    },

    // Overriding core REST endpoints for strict security and ownership boundaries
    async find(ctx) {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized();
      }

      // Enforce filter on user.documentId
      const query = ctx.query as any;
      query.filters = {
        ...(query.filters || {}),
        user: {
          documentId: {
            $eq: user.documentId,
          },
        },
      };

      const { results, pagination } = await strapi.service("api::todo.todo").find(query);
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
        return ctx.badRequest("Missing \"data\" payload in request body");
      }

      // Sanitize the input fields provided by the client
      const sanitizedInputData = (await this.sanitizeInput(body.data, ctx)) as any;

      // Call the service directly and associate with the user's documentId (bypassing REST input validation)
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

      // Prevent re-assigning the todo to another user
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
