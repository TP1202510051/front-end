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
    "/api/v1/projects/{id}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["acceptRevision"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/operations/{id}/cancellation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelOperation"];
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
    "/api/v1/operations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getOperation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/component-registries/{registryVersion}/templates/{templateVersion}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getRegistryPublication"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ProjectName: {
            name: string;
        };
        AcceptedRevisionView: {
            id: string;
            /** Format: int64 */
            number: number;
            registryVersion: string;
            templateVersion: string;
            /** Format: date-time */
            acceptedAt: string;
            hash: string;
            document: components["schemas"]["ProjectDocumentView"];
        };
        ProjectComponentView: {
            id: string;
            type: string;
            properties: {
                [key: string]: string;
            };
            bindings: {
                [key: string]: string;
            };
            slots: {
                [key: string]: string[];
            };
        };
        ProjectDocumentView: {
            schemaVersion: string;
            registryVersion: string;
            templateVersion: string;
            pages: components["schemas"]["ProjectPageView"][];
        };
        ProjectPageView: {
            id: string;
            path: string;
            rootComponentId: string;
            components: components["schemas"]["ProjectComponentView"][];
        };
        StoreProjectView: {
            id: string;
            name: string;
            /** Format: date-time */
            createdAt: string;
            imageUrl?: string;
            acceptedRevision: components["schemas"]["AcceptedRevisionView"];
        };
        OperationBatchInput: {
            baseRevisionId: string;
            idempotencyKey: string;
            operations: components["schemas"]["ProjectOperationInput"][];
        };
        ProjectComponentInput: {
            id: string;
            type: string;
            properties?: {
                [key: string]: string;
            };
            bindings?: {
                [key: string]: string;
            };
            slots?: {
                [key: string]: string[];
            };
        };
        ProjectOperationInput: {
            /** @enum {string} */
            kind: "SET_PROPERTY" | "INSERT_COMPONENT" | "REMOVE_COMPONENT" | "MOVE_COMPONENT";
            pageId: string;
            componentId?: string;
            property?: string;
            value?: string;
            parentComponentId?: string;
            slot?: string;
            /** Format: int32 */
            index?: number;
            component?: components["schemas"]["ProjectComponentInput"];
        };
        AsyncOperationView: {
            /** Format: uuid */
            operationId: string;
            /** @enum {string} */
            workType: "ASSISTANT_PROPOSAL" | "STORE_EXPORT";
            /** @enum {string} */
            state: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
            stage: string;
            /** Format: int32 */
            progress?: number | null;
            /** Format: int64 */
            version: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            startedAt?: string | null;
            /** Format: date-time */
            updatedAt: string;
            /** Format: date-time */
            finishedAt?: string | null;
            resultReference?: components["schemas"]["OperationResourceReference"];
            failureCode?: string | null;
            availableActions: components["schemas"]["OperationAction"][];
        };
        /** @enum {string} */
        OperationAction: "CANCEL" | "START_NEW_OPERATION" | "REFRESH_STATUS";
        OperationResourceReference: {
            type: string;
            id: string;
        } | null;
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
        RegistryBindingView: {
            name: string;
            source: string;
            required: boolean;
        };
        RegistryComponentView: {
            type: string;
            properties: {
                [key: string]: components["schemas"]["RegistryPropertyView"];
            };
            slots: {
                [key: string]: components["schemas"]["RegistrySlotView"];
            };
            bindings: components["schemas"]["RegistryBindingView"][];
            constraints: string[];
        };
        RegistryCompositionView: {
            schemaVersion: string;
            registryVersion: string;
            templateVersion: string;
            pages: components["schemas"]["RegistryPageView"][];
        };
        RegistryInstanceView: {
            id: string;
            type: string;
            properties: {
                [key: string]: string;
            };
            bindings: {
                [key: string]: string;
            };
            slots: {
                [key: string]: string[];
            };
        };
        RegistryPageView: {
            id: string;
            path: string;
            rootComponentId: string;
            components: components["schemas"]["RegistryInstanceView"][];
        };
        RegistryPropertyView: {
            type: string;
            required: boolean;
            /** Format: int32 */
            minLength: number;
            /** Format: int32 */
            maxLength: number;
        };
        RegistryPublicationView: {
            registryVersion: string;
            components: components["schemas"]["RegistryComponentView"][];
            template: components["schemas"]["VerifiedTemplateView"];
        };
        RegistrySlotView: {
            allowedTypes: string[];
            /** Format: int32 */
            minimum: number;
            /** Format: int32 */
            maximum: number;
        };
        VerifiedTemplateView: {
            templateVersion: string;
            composition: components["schemas"]["RegistryCompositionView"];
        };
        /** @enum {string} */
        ProblemCode: "BAD_REQUEST" | "AUTHENTICATION_REQUIRED" | "RESOURCE_NOT_FOUND" | "METHOD_NOT_ALLOWED" | "NOT_ACCEPTABLE" | "CONFLICT" | "IDEMPOTENCY_KEY_REUSED" | "UNSUPPORTED_MEDIA_TYPE" | "SEMANTIC_VALIDATION_FAILED" | "RATE_LIMITED" | "DEPENDENCY_UNAVAILABLE" | "INTERNAL_ERROR";
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
                    "*/*": components["schemas"]["StoreProjectView"];
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
    acceptRevision: {
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
                "application/json": components["schemas"]["OperationBatchInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StoreProjectView"];
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
    cancelOperation: {
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
                    "*/*": components["schemas"]["AsyncOperationView"];
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
                    "*/*": components["schemas"]["StoreProjectView"];
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
    getOperation: {
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
                    "*/*": components["schemas"]["AsyncOperationView"];
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
    getRegistryPublication: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                registryVersion: string;
                templateVersion: string;
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
                    "*/*": components["schemas"]["RegistryPublicationView"];
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
