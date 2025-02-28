import joplin from 'api';
import { SettingItemType } from 'api/types';
import prompts = require('./assets/prompts.json');

export interface JarvisSettings {
    openai_api_key: string;
    model: string;
    temperature: number;
    max_tokens: number;
    memory_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    include_prompt: boolean;
    instruction: string;
    scope: string;
    role: string;
    reasoning: string;
    chat_prefix: string;
    chat_suffix: string;
}

function parse_dropdown_json(json: any): string {
    let options = '';
    for (let [key, value] of Object.entries(json)) {
        options += `<option value="${value}">${key}</option>`;
    }
    return options;
}

async function parse_dropdown_setting(name: string): Promise<string> {
    const setting = await joplin.settings.value(name);
    const empty = '<option value=""></option>';
    const preset = parse_dropdown_json(prompts[name]);
    try {
        return empty + parse_dropdown_json(JSON.parse(setting)) + preset
    } catch (e) {
        return empty + preset;
    }
}

export async function get_settings(): Promise<JarvisSettings> {
    return {
        openai_api_key: await joplin.settings.value('openai_api_key'),
        model: await joplin.settings.value('model'),
        temperature: (await joplin.settings.value('temp')) / 10,
        max_tokens: await joplin.settings.value('max_tokens'),
        memory_tokens: await joplin.settings.value('memory_tokens'),
        top_p: (await joplin.settings.value('top_p')) / 100,
        frequency_penalty: (await joplin.settings.value('frequency_penalty')) / 10,
        presence_penalty: (await joplin.settings.value('presence_penalty')) / 10,
        include_prompt: await joplin.settings.value('include_prompt'),
        instruction: await parse_dropdown_setting('instruction'),
        scope: await parse_dropdown_setting('scope'),
        role: await parse_dropdown_setting('role'),
        reasoning: await parse_dropdown_setting('reasoning'),
        chat_prefix: (await joplin.settings.value('chat_prefix')).replace(/\\n/g, '\n'),
        chat_suffix: (await joplin.settings.value('chat_suffix')).replace(/\\n/g, '\n'),
    }
}

export async function register_settings() {
    await joplin.settings.registerSection('jarvis', {
        label: 'Jarvis',
        iconName: 'fas fa-robot',
    });

    await joplin.settings.registerSettings({
        'openai_api_key': {
            value: '',
            type: SettingItemType.String,
            secure: true,
            section: 'jarvis',
            public: true,
            label: 'OpenAI API Key',
            description: 'Your OpenAI API Key',
        },
        'model': {
            value: 'text-davinci-003',
            type: SettingItemType.String,
            isEnum: true,
            section: 'jarvis',
            public: true,
            label: 'Model',
            description: 'The model to use for asking Jarvis',
            options: {
                'text-davinci-003': 'text-davinci-003',
                'text-davinci-002': 'text-davinci-002',
                'text-curie-001': 'text-curie-001',
                'text-babbage-001': 'text-babbage-001',
                'text-ada-001': 'text-ada-001',
            }
        },
        'temp': {
            value: 9,
            type: SettingItemType.Int,
            minimum: 0,
            maximum: 10,
            step: 1,
            section: 'jarvis',
            public: true,
            label: 'Temperature',
            description: 'The temperature of the model. 0 is the least creative. 10 is the most creative. Higher values produce more creative results, but can also result in more nonsensical text.',
        },
        'max_tokens': {
            value: 256,
            type: SettingItemType.Int,
            minimum: 16,
            maximum: 4096,
            step: 16,
            section: 'jarvis',
            public: true,
            label: 'Max Tokens',
            description: 'The maximum number of tokens to generate. Higher values will result in more text, but can also result in more nonsensical text.',
        },
        'memory_tokens': {
            value: 128,
            type: SettingItemType.Int,
            minimum: 16,
            maximum: 4096,
            step: 16,
            section: 'jarvis',
            public: true,
            label: 'Memory Tokens',
            description: 'The number of tokens to keep in memory when chatting with Jarvis. Higher values will result in more coherent conversations. Must be lower than max_tokens.',
        },
        'top_p': {
            value: 100,
            type: SettingItemType.Int,
            minimum: 0,
            maximum: 100,
            step: 1,
            section: 'jarvis',
            public: true,
            label: 'Top P',
            description: 'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p (between 0 and 100) probability mass. So 10 means only the tokens comprising the top 10% probability mass are considered.',
        },
        'frequency_penalty': {
            value: 0,
            type: SettingItemType.Int,
            minimum: -20,
            maximum: 20,
            step: 1,
            section: 'jarvis',
            public: true,
            label: 'Frequency Penalty',
            description: "A value between -20 and 20. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.",
        },
        'presence_penalty': {
            value: 0,
            type: SettingItemType.Int,
            minimum: -20,
            maximum: 20,
            step: 1,
            section: 'jarvis',
            public: true,
            label: 'Presence Penalty',
            description: "A value between -20 and 20. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.",
        },
        'include_prompt': {
            value: false,
            type: SettingItemType.Bool,
            section: 'jarvis',
            public: true,
            label: 'Include prompt in response',
        },
        'chat_prefix': {
            value: '',
            type: SettingItemType.String,
            section: 'jarvis',
            public: true,
            label: 'Prefix to add to each chat prompt (before the response).',
            description: 'e.g., "\\n\\nJarvis:"',
        },
        'chat_suffix': {
            value: '\\n\\nUser: ',
            type: SettingItemType.String,
            section: 'jarvis',
            public: true,
            label: 'Suffix to add to each chat response (after the response).',
            description: 'e.g., "\\n\\nUser: "',
        },
        'instruction': {
            value: '',
            type: SettingItemType.String,
            section: 'jarvis',
            public: true,
            advanced: true,
            label: 'Instruction dropdown options',
            description: 'Favorite instruction prompts to show in dropdown ({label:prompt, ...} JSON).',
        },
        'scope': {
            value: '',
            type: SettingItemType.String,
            section: 'jarvis',
            public: true,
            advanced: true,
            label: 'Scope dropdown options',
            description: 'Favorite scope prompts to show in dropdown ({label:prompt, ...} JSON).',
        },
        'role': {
            value: '',
            type: SettingItemType.String,
            section: 'jarvis',
            public: true,
            advanced: true,
            label: 'Role dropdown options',
            description: 'Favorite role prompts to show in dropdown ({label:prompt, ...} JSON).',
        },
        'reasoning': {
            value: '',
            type: SettingItemType.String,
            section: 'jarvis',
            public: true,
            advanced: true,
            label: 'Reasoning dropdown options',
            description: 'Favorite reasoning prompts to show in dropdown ({label:prompt, ...} JSON).',
        },
    });
}
