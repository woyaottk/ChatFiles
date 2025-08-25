import { KeyConfiguration, ModelType } from "@/types";
import { OpenAIChat } from "langchain/llms/openai";
import {CallbackManager} from "langchain/callbacks";
import {NextApiResponse} from "next";

export const getModel = async (keyConfiguration: KeyConfiguration, res: NextApiResponse) => {
    if (keyConfiguration.apiType === ModelType.AZURE_OPENAI) {
        return new OpenAIChat({
            temperature: 0.9,
            streaming: true,
            azureOpenAIApiKey: keyConfiguration.azureApiKey,
            azureOpenAIApiInstanceName: keyConfiguration.azureInstanceName,
            azureOpenAIApiDeploymentName: keyConfiguration.azureDeploymentName,
            azureOpenAIApiVersion: keyConfiguration.azureApiVersion,
            callbacks: getCallbackManager(res),
        });
    } else {
        return new OpenAIChat({
            temperature: 0.9,
            modelName: keyConfiguration.apiModel,
            streaming: true,
            openAIApiKey: keyConfiguration.apiKey,
            callbacks: getCallbackManager(res),
        });
    }
}

export const getChatModel = async (keyConfiguration: KeyConfiguration, res: NextApiResponse, isSSE: boolean = false) => {
    if (keyConfiguration.apiType === ModelType.AZURE_OPENAI) {
        return new OpenAIChat({
            temperature: 0.9,
            streaming: true,
            azureOpenAIApiKey: keyConfiguration.azureApiKey,
            azureOpenAIApiInstanceName: keyConfiguration.azureInstanceName,
            azureOpenAIApiDeploymentName: keyConfiguration.azureDeploymentName,
            azureOpenAIApiVersion: keyConfiguration.azureApiVersion,
            callbacks: getCallbackManager(res, isSSE),
        });
    } else {
        return new OpenAIChat({
            temperature: 0.9,
            modelName: keyConfiguration.apiModel,
            streaming: true,
            openAIApiKey: keyConfiguration.apiKey,
            callbacks: getCallbackManager(res, isSSE),
        });
    }
}

export const getCallbackManager = (res: NextApiResponse, isSSE: boolean = false) => {
    return CallbackManager.fromHandlers({
        handleLLMNewToken: async (token: string, runId: string, parentRunId?: string) =>{
            if (isSSE) {
                const data = JSON.stringify({ text: token });
                res.write(`data: ${data}\n\n`);
            } else {
                res.write(token);
            }
        },
        handleLLMEnd: async () => {
            if (isSSE) {
                res.write('data: [DONE]\n\n');
            }
            res.end();
        },
        handleLLMError: async (error: Error) => {
            console.error('LLM Error:', error);
            if (isSSE) {
                const errorData = JSON.stringify({ error: error.message });
                res.write(`data: ${errorData}\n\n`);
            }
            res.end();
        }
    })
}