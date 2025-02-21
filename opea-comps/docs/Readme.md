## Microservices

A MicroService instance does two things:
1. it contains API Gateway to an underlying service.  eg: LLM, Embedding, Reranker.
2. the instance itself is used within the [Orchestrator](https://github.com/opea-project/GenAIComps/blob/main/comps/cores/mega/orchestrator.py) to orchestrate a pipeline within the orchestrator's directed acyclic graph (DAG)


### Underlying FastAPI App

[MicroService](https://github.com/opea-project/GenAIComps/blob/main/comps/cores/mega/micro_service.py) inherits [HTTPService](https://github.com/opea-project/GenAIComps/blob/main/comps/cores/mega/http_service.py) which inturn inherits [BaseService](https://github.com/opea-project/GenAIComps/blob/main/comps/cores/mega/base_service.py)

BaseService provides some abstract functions you can override, the HTTPService creates a FastAPI that serves the api via [Uvicorn](https://www.uvicorn.org/) Web server.

There are couples of endpoints defined by HTTPService for this app:
- /v1/health_check
- /v1/health (just points to /health_check)
- /v1/statistics

### Defining a Microservice vs MegaService

Here's an example of defining an LLM as a microservice.


```py
llm = MicroService(
    name="llm",
    host=LLM_SERVER_HOST_IP,
    port=LLM_SERVER_PORT,
    endpoint="/v1/chat/completions",
    use_remote_service=True,
    service_type=ServiceType.LLM,
)
```

By checking the [constants.py](https://github.com/opea-project/GenAIComps/blob/main/comps/cores/mega/constants.py) we can see the following `ServiceTypes` that we can be assigned to the microservice.

```
GATEWAY = 0
EMBEDDING = 1
RETRIEVER = 2
RERANK = 3
LLM = 4
ASR = 5
TTS = 6
GUARDRAIL = 7
VECTORSTORE = 8
DATAPREP = 9
UNDEFINED = 10
RAGAS = 11
LVM = 12
KNOWLEDGE_GRAPH = 13
WEB_RETRIEVER = 14
IMAGE2VIDEO = 15
TEXT2IMAGE = 16
ANIMATION = 17
IMAGE2IMAGE = 18
TEXT2SQL = 19
```

We also use `MicroService` class to define the MegaService by using `ServiceRoleType.MEGASERVICE` (also found in the [constants.py](https://github.com/opea-project/GenAIComps/blob/main/comps/cores/mega/constants.py)).

```py
self.service = MicroService(
    self.__class__.__name__,
    service_role=ServiceRoleType.MEGASERVICE,
    host=self.host,
    port=self.port,
    endpoint="/v1/example-service",
    input_datatype=ChatCompletionRequest,
    output_datatype=ChatCompletionResponse,
)
```

Note that `ServiceType` role has the following:
```py
MICROSERVICE = 0
MEGASERVICE = 1
```
