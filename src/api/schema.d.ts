export interface paths {
    "/api/v1/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listProjects"];
        put?: never;
        post: operations["createProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getProject"];
        put?: never;
        post?: never;
        delete: operations["deleteProject"];
        options?: never;
        head?: never;
        patch: operations["renameProject"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ProjectName: {
            name: string;
        };
        ProjectSummary: {
            /** @example 900001 */
            id: string;
            name: string;
            createdAt: string;
            imageUrl?: string | null;
        };
        ProjectPage: {
            items: components["schemas"]["ProjectSummary"][];
            /** @description Pass as after to read the next page; null means complete */
            nextCursor?: string | null;
        };
        /** @enum {string} */
        ProblemCode: "BAD_REQUEST" | "AUTHENTICATION_REQUIRED" | "RESOURCE_NOT_FOUND" | "METHOD_NOT_ALLOWED" | "NOT_ACCEPTABLE" | "CONFLICT" | "UNSUPPORTED_MEDIA_TYPE" | "SEMANTIC_VALIDATION_FAILED" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
        PublicProblem: {
            type: string;
            title: string;
            /** Format: int32 */
            status: number;
            code: components["schemas"]["ProblemCode"];
            detail: string;
            /** Format: uuid */
            correlationId: string;
            recoveryAction: components["schemas"]["RecoveryAction"];
            operationId?: string | null;
        };
        /** @enum {string} */
        RecoveryAction: "EDIT_REQUEST" | "SIGN_IN" | "RETURN_TO_PROJECTS" | "REFRESH" | "RETRY_LATER" | "CONTACT_SUPPORT";
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listProjects: {
        parameters: {
            query?: {
                after?: string;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProjectPage"];
                };
            };
            /** @description Public problem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            406: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
        };
    };
    createProject: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectName"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProjectSummary"];
                };
            };
            /** @description Public problem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            406: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
        };
    };
    getProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProjectSummary"];
                };
            };
            /** @description Public problem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            406: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
        };
    };
    deleteProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Public problem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            406: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
        };
    };
    renameProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectName"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProjectSummary"];
                };
            };
            /** @description Public problem */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            406: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            415: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
            /** @description Public problem */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["PublicProblem"];
                };
            };
        };
    };
}
