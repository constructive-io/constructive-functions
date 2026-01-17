
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export interface FunctionConfig {
    [key: string]: string | undefined;
}

export const loadConfig = (fnName: string): FunctionConfig => {
    const config: FunctionConfig = {};

    // 1. Load Root .env
    const rootEnvPath = path.join(__dirname, '../.env');
    if (fs.existsSync(rootEnvPath)) {
        const rootEnv = dotenv.parse(fs.readFileSync(rootEnvPath));
        Object.assign(config, rootEnv);
    }

    // 2. Load Function config.json OR package.json config block? 
    // Let's stick to config.json for explicit overrides, or look at package.json "config"
    const fnPath = path.join(__dirname, '../functions', fnName);
    const configJsonPath = path.join(fnPath, 'config.json');
    if (fs.existsSync(configJsonPath)) {
        try {
            const jsonConfig = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
            Object.assign(config, jsonConfig);
        } catch (e) {
            console.error(`Error loading config.json for ${fnName}`, e);
        }
    }

    // 3. Load Function .env
    const fnEnvPath = path.join(fnPath, '.env');
    if (fs.existsSync(fnEnvPath)) {
        const fnEnv = dotenv.parse(fs.readFileSync(fnEnvPath));
        Object.assign(config, fnEnv);
    }

    // 4. Load System Env (process.env) - usually has highest priority or base?
    // In local dev, we might want to let process.env override everything, OR let .env override process.env?
    // Usually process.env wins.
    Object.assign(config, process.env);

    return config;
};

export const applyConfigToProcess = (fnName: string) => {
    const config = loadConfig(fnName);
    for (const key in config) {
        if (config[key] !== undefined) {
            process.env[key] = config[key];
        }
    }
};
