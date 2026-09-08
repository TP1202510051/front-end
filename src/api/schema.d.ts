export interface paths {
    "/api/v1/projects/{projectId}/products/{productId}/variants/{variantId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateSellableVariant"];
        post?: never;
        delete: operations["archiveSellableVariant"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/products/{productId}/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listProductMedia"];
        put: operations["illustrateTextileProduct"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/products/{productId}/category": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["classifyTextileProduct"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/collections/{collectionId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["curateProductCollection"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
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
    "/api/v1/projects/{projectId}/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listTextileProducts"];
        put?: never;
        post: operations["createTextileProduct"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/products/{productId}/variants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["addSellableVariant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/collections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listProductCollections"];
        put?: never;
        post: operations["createProductCollection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listProductCategories"];
        put?: never;
        post: operations["createProductCategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assistant/proposals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listAssistantProposals"];
        put?: never;
        post: operations["proposeAssistantChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assistant/proposals/{proposalId}/cancellation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelAssistantProposal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assistant/proposals/{proposalId}/rejection": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["rejectAssistantProposal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assistant/proposals/{proposalId}/acceptance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["acceptAssistantProposal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listProjectAssets"];
        put?: never;
        post: operations["uploadProjectAsset"];
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
        get: operations["listRevisions"];
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
    "/api/v1/projects/{projectId}/products/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["describeTextileProduct"];
        put?: never;
        post?: never;
        delete: operations["archiveTextileProduct"];
        options?: never;
        head?: never;
        patch: operations["updateTextileProduct"];
        trace?: never;
    };
    "/api/v1/projects/{projectId}/collections/{collectionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["removeProductCollection"];
        options?: never;
        head?: never;
        patch: operations["renameProductCollection"];
        trace?: never;
    };
    "/api/v1/projects/{projectId}/categories/{categoryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["removeProductCategory"];
        options?: never;
        head?: never;
        patch: operations["renameProductCategory"];
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assets/{assetId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["describeProjectAsset"];
        put?: never;
        post?: never;
        delete: operations["removeProjectAsset"];
        options?: never;
        head?: never;
        patch: operations["describeProjectAssetText"];
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
    "/api/v1/projects/{projectId}/catalog/resolution": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["resolveCatalogBinding"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assistant/proposals/{proposalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getAssistantProposal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{projectId}/assets/{assetId}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["readProjectAsset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/projects/{id}/revisions/{number}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getRevision"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
        /** @description Null charges the product's base price */
        MoneyInput: {
            /**
             * Format: int64
             * @description Amount in the currency's minor units
             */
            amount?: number;
            currency: string;
        } | null;
        SellableVariantInput: {
            sku: string;
            size: string;
            color: string;
            price?: components["schemas"]["MoneyInput"];
            /** Format: int32 */
            stock?: number;
        };
        MoneyView: {
            /**
             * Format: int64
             * @description Amount in the currency's minor units
             */
            amount: number;
            currency: string;
        };
        SellableVariantView: {
            id: string;
            sku: string;
            size: string;
            color: string;
            price: components["schemas"]["MoneyView"];
            pricedApart: boolean;
            status: string;
            /** Format: int32 */
            stock: number;
        };
        TextileProductView: {
            id: string;
            name: string;
            description: string;
            basePrice: components["schemas"]["MoneyView"];
            status: string;
            /** @description Null means the product is not classified yet */
            categoryId?: string | null;
            media: string[];
            variants: components["schemas"]["SellableVariantView"][];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        ProductMediaInput: {
            assetIds: string[];
        };
        ProductCategoryInput: {
            /** @description Null leaves the product unclassified */
            categoryId?: string | null;
        };
        CollectionMembersInput: {
            productIds: string[];
        };
        ProductCollectionView: {
            id: string;
            name: string;
            productIds: string[];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
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
            /** @enum {string} */
            origin: "VERIFIED_TEMPLATE" | "MANUAL_BATCH" | "ASSISTANT_PROPOSAL" | "IMPORT" | "MIGRATION";
            basedOnRevisionId?: string | null;
            document: components["schemas"]["ProjectDocumentView"];
        };
        BlockInstanceView: {
            id: string;
            blockId: string;
            pageId: string;
            rootComponentId: string;
            componentIds: {
                [key: string]: string;
            };
            detached: boolean;
        };
        CatalogBindingView: {
            /** @enum {string} */
            target: "COLLECTION" | "CATEGORY" | "PRODUCT" | "EVERYTHING";
            /** @description Null means nothing has been chosen yet */
            reference?: string | null;
            /** Format: int32 */
            limit: number;
            /** @enum {string} */
            order: "CURATED" | "NEWEST" | "NAME" | "PRICE_ASCENDING" | "PRICE_DESCENDING";
        };
        ProjectBlockView: {
            id: string;
            name: string;
            rootComponentId: string;
            components: components["schemas"]["ProjectComponentView"][];
        };
        ProjectComponentView: {
            id: string;
            type: string;
            properties: {
                [key: string]: string;
            };
            bindings: {
                [key: string]: components["schemas"]["CatalogBindingView"];
            };
            interactions: {
                [key: string]: string;
            };
            slots: {
                [key: string]: string[];
            };
            styles: {
                [key: string]: string;
            };
        };
        ProjectDocumentView: {
            schemaVersion: string;
            registryVersion: string;
            templateVersion: string;
            pages: components["schemas"]["ProjectPageView"][];
            blocks: components["schemas"]["ProjectBlockView"][];
            blockInstances: components["schemas"]["BlockInstanceView"][];
            theme: components["schemas"]["ProjectThemeView"];
        };
        ProjectPageView: {
            id: string;
            /** @enum {string} */
            kind: "HOME" | "CATALOG" | "CONTENT";
            path: string;
            rootComponentId: string;
            components: components["schemas"]["ProjectComponentView"][];
        };
        ProjectThemeView: {
            tokens: {
                [key: string]: string;
            };
            rules: components["schemas"]["StyleRuleView"][];
        };
        StoreProjectView: {
            id: string;
            name: string;
            /** Format: date-time */
            createdAt: string;
            imageUrl?: string;
            acceptedRevision: components["schemas"]["AcceptedRevisionView"];
        };
        StyleRuleView: {
            /** @description Condicion de ancho, o ausente si la regla vale siempre */
            media?: string;
            selector: string;
            declarations: {
                [key: string]: string;
            };
        };
        TextileProductInput: {
            name: string;
            description?: string;
            basePrice: components["schemas"]["MoneyInput"];
        };
        CatalogNameInput: {
            name: string;
        };
        ProductCategoryView: {
            id: string;
            name: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        AssistantInstructionInput: {
            /** @example Pon el color primario en #1a2b3c */
            instruction: string;
            /** @enum {string} */
            scope: "PROJECT" | "PAGE";
            /** @description Obligatoria cuando el alcance es PAGE */
            scopePageId?: string;
            idempotencyKey: string;
        };
        AssistantProposalReceiptView: {
            operationId: string;
            proposalId: string;
        };
        AssistantProposalView: {
            proposalId: string;
            projectId: string;
            /** @enum {string} */
            state: "PENDING" | "DRAFTED" | "ACCEPTED" | "REJECTED" | "FAILED" | "CANCELLED";
            /** @enum {string} */
            outcome: "WORKING" | "CHANGE_AVAILABLE" | "CLARIFICATION_REQUIRED" | "NO_CHANGE" | "UNSUPPORTED" | "STALE_CONTEXT" | "CANCELLED" | "FAILED" | "ACCEPTED" | "REJECTED";
            instruction: string;
            baseRevisionId: string;
            /** @enum {string} */
            scope: "PROJECT" | "PAGE";
            scopePageId?: string;
            modelSummary?: string;
            effects: string[];
            losses: string[];
            refused: string[];
            destructive: boolean;
            preview?: components["schemas"]["ProjectDocumentView"];
            unavailable?: string;
            acceptedRevisionId?: string;
            createdAt: string;
            decidedAt?: string;
        };
        AssistantAcceptanceInput: {
            idempotencyKey: string;
        };
        AssetDerivativeView: {
            /** Format: int32 */
            width: number;
            /** Format: int32 */
            height: number;
            digest: string;
            /** Format: int64 */
            bytes: number;
        };
        ProjectAssetView: {
            id: string;
            contentType: string;
            /** Format: int32 */
            width: number;
            /** Format: int32 */
            height: number;
            /** Format: int64 */
            bytes: number;
            alternativeText: string;
            digest: string;
            derivatives: components["schemas"]["AssetDerivativeView"][];
            /** Format: date-time */
            uploadedAt: string;
        };
        /** @description La eleccion de catalogo, solo en SET_BINDING */
        CatalogBindingInput: {
            target: string;
            reference?: string;
            /** Format: int32 */
            limit?: number;
            order: string;
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
                [key: string]: components["schemas"]["CatalogBindingInput"];
            };
            interactions?: {
                [key: string]: string;
            };
            slots?: {
                [key: string]: string[];
            };
        };
        ProjectOperationInput: {
            /** @enum {string} */
            kind: "SET_PROPERTY" | "INSERT_COMPONENT" | "REMOVE_COMPONENT" | "MOVE_COMPONENT" | "ADD_PAGE" | "REMOVE_PAGE" | "MOVE_PAGE" | "CREATE_BLOCK" | "INSTANTIATE_BLOCK" | "SET_BLOCK_PROPERTY" | "DETACH_BLOCK" | "SET_THEME_TOKEN" | "SET_PROJECT_STYLES" | "SET_COMPONENT_STYLE" | "SET_BLOCK_STYLE" | "SET_BINDING";
            /** @description La pagina que toca; ausente cuando la operacion es del proyecto entero */
            pageId?: string;
            componentId?: string;
            property?: string;
            value?: string;
            parentComponentId?: string;
            slot?: string;
            /** Format: int32 */
            index?: number;
            /** @enum {string} */
            pageKind?: "HOME" | "CATALOG" | "CONTENT";
            path?: string;
            component?: components["schemas"]["ProjectComponentInput"];
            blockId?: string;
            instanceId?: string;
            name?: string;
            css?: string;
            binding?: components["schemas"]["CatalogBindingInput"];
        };
        OperationConflictView: {
            /** @enum {string} */
            kind: "PROPERTY_CHANGED" | "TARGET_MISSING" | "STRUCTURE_CHANGED";
            pageId?: string | null;
            componentId?: string | null;
            property?: string | null;
            attempted?: string | null;
            current?: string | null;
        };
        RevisionConflictView: {
            baseRevisionId: string;
            headRevisionId: string;
            conflicts: components["schemas"]["OperationConflictView"][];
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
        AlternativeTextInput: {
            alternativeText: string;
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
        TextileProductPage: {
            items: components["schemas"]["TextileProductView"][];
            /** @description Pass as after to read the next page; null means complete */
            nextCursor?: string | null;
        };
        CatalogResolutionView: {
            products: components["schemas"]["TextileProductView"][];
            /** @enum {string} */
            outcome: "SHOWING" | "UNCHOSEN" | "MISSING" | "EMPTY";
        };
        RevisionHistoryView: {
            items: components["schemas"]["RevisionSummaryView"][];
            nextCursor?: string | null;
        };
        RevisionSummaryView: {
            id: string;
            /** Format: int64 */
            number: number;
            parentId?: string | null;
            /** @enum {string} */
            origin: "VERIFIED_TEMPLATE" | "MANUAL_BATCH" | "ASSISTANT_PROPOSAL" | "IMPORT" | "MIGRATION";
            actorId: string;
            registryVersion: string;
            templateVersion: string;
            hash: string;
            /** Format: date-time */
            acceptedAt: string;
        };
        RegistryBindingView: {
            name: string;
            source: string;
            required: boolean;
            targets: string[];
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
            interactions: components["schemas"]["RegistryInteractionView"][];
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
                [key: string]: components["schemas"]["CatalogBindingView"];
            };
            interactions: {
                [key: string]: string;
            };
            slots: {
                [key: string]: string[];
            };
        };
        RegistryInteractionView: {
            name: string;
            required: boolean;
        };
        RegistryPageDefinitionView: {
            /** @enum {string} */
            kind: "HOME" | "CATALOG" | "CONTENT";
            required: boolean;
            path?: string | null;
            rootTypes: string[];
        };
        RegistryPageView: {
            id: string;
            /** @enum {string} */
            kind: "HOME" | "CATALOG" | "CONTENT";
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
            pages: components["schemas"]["RegistryPageDefinitionView"][];
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
            /** @description Sitio y codigo de cada regla no admitida */
            issues: string[];
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
    updateSellableVariant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
                variantId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SellableVariantInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TextileProductView"];
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
    archiveSellableVariant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
                variantId: string;
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
                    "*/*": components["schemas"]["TextileProductView"];
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
    listProductMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
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
                    "*/*": string[];
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
    illustrateTextileProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductMediaInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string[];
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
    classifyTextileProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductCategoryInput"];
            };
        };
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
    curateProductCollection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                collectionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CollectionMembersInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductCollectionView"];
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
    listTextileProducts: {
        parameters: {
            query?: {
                after?: string;
                limit?: number;
            };
            header?: never;
            path: {
                projectId: string;
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
                    "*/*": components["schemas"]["TextileProductPage"];
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
    createTextileProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TextileProductInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TextileProductView"];
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
    addSellableVariant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SellableVariantInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TextileProductView"];
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
    listProductCollections: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
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
                    "*/*": components["schemas"]["ProductCollectionView"][];
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
    createProductCollection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogNameInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductCollectionView"];
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
    listProductCategories: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
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
                    "*/*": components["schemas"]["ProductCategoryView"][];
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
    createProductCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogNameInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductCategoryView"];
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
    listAssistantProposals: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path: {
                projectId: string;
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
                    "*/*": components["schemas"]["AssistantProposalView"][];
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
    proposeAssistantChange: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssistantInstructionInput"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AssistantProposalReceiptView"];
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
    cancelAssistantProposal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                proposalId: string;
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
                    "*/*": components["schemas"]["AssistantProposalView"];
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
    rejectAssistantProposal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                proposalId: string;
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
                    "*/*": components["schemas"]["AssistantProposalView"];
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
    acceptAssistantProposal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                proposalId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AssistantAcceptanceInput"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AssistantProposalView"];
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
    listProjectAssets: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
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
                    "*/*": components["schemas"]["ProjectAssetView"][];
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
    uploadProjectAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                    alternativeText: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProjectAssetView"];
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
    listRevisions: {
        parameters: {
            query?: {
                before?: string;
                limit?: number;
            };
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
                    "*/*": components["schemas"]["RevisionHistoryView"];
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
            /** @description Accepted revision */
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
            /** @description Revision conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RevisionConflictView"];
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
    describeTextileProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
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
                    "*/*": components["schemas"]["TextileProductView"];
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
    archiveTextileProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
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
                    "*/*": components["schemas"]["TextileProductView"];
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
    updateTextileProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                productId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TextileProductInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["TextileProductView"];
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
    removeProductCollection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                collectionId: string;
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
    renameProductCollection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                collectionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogNameInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductCollectionView"];
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
    removeProductCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                categoryId: string;
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
    renameProductCategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                categoryId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CatalogNameInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProductCategoryView"];
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
    describeProjectAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                assetId: string;
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
                    "*/*": components["schemas"]["ProjectAssetView"];
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
    removeProjectAsset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                assetId: string;
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
    describeProjectAssetText: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                assetId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AlternativeTextInput"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ProjectAssetView"];
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
    resolveCatalogBinding: {
        parameters: {
            query: {
                scope: string;
                reference?: string;
                limit?: number;
                order?: string;
            };
            header?: never;
            path: {
                projectId: string;
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
                    "*/*": components["schemas"]["CatalogResolutionView"];
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
    getAssistantProposal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
                proposalId: string;
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
                    "*/*": components["schemas"]["AssistantProposalView"];
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
    readProjectAsset: {
        parameters: {
            query?: {
                width?: number;
            };
            header?: never;
            path: {
                projectId: string;
                assetId: string;
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
                    "*/*": string;
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
    getRevision: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                number: string;
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
