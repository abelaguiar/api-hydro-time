declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';

  interface SwaggerUiOptions {
    customCss?: string;
    customJs?: string;
    customfavIcon?: string;
    swaggerOptions?: Record<string, unknown>;
    swaggerUrl?: string;
    url?: string;
    urls?: Array<{ url: string; name: string }>;
    explorer?: boolean;
    swaggerVersion?: string;
  }

  function serve(
    req: any,
    res: any,
    next: any
  ): void | Promise<void>;

  function setup(
    swaggerDoc: Record<string, any>,
    options?: SwaggerUiOptions
  ): RequestHandler;

  export { serve, setup };
}

declare module 'swagger-jsdoc' {
  interface SwaggerDefinition {
    openapi?: string;
    swagger?: string;
    info?: {
      title: string;
      version: string;
      description?: string;
      contact?: Record<string, unknown>;
      license?: Record<string, unknown>;
    };
    servers?: Array<{ url: string; description?: string }>;
    basePath?: string;
    schemes?: string[];
    consumes?: string[];
    produces?: string[];
    paths?: Record<string, unknown>;
    components?: Record<string, unknown>;
    security?: Array<Record<string, unknown>>;
    tags?: Array<{ name: string; description?: string }>;
    externalDocs?: { url: string; description?: string };
  }

  interface SwaggerOptions {
    definition: SwaggerDefinition;
    apis: string[];
  }

  function swaggerJsdoc(options: SwaggerOptions): Record<string, any>;

  export = swaggerJsdoc;
}
