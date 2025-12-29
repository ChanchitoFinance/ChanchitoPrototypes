const fs = require('fs');
const path = require('path');

let fengari;
try {
    fengari = require('fengari');
} catch (e) {
    throw new Error(
        'fengari is required. Install it with: npm install fengari'
    );
}

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

class EnvValidator {
    constructor(luaPath = null, logger = null) {
        try {
            this.luaPath = luaPath || this._findLuaPath();
            this.logger = logger || this._createDefaultLogger();
            this.L = null;
            this.envModule = null;
            this._loadLuaModules();
        } catch (error) {
            if (this.logger) {
                this.logger.error(`Failed to initialize: ${error.message}`);
            }
            throw error;
        }
    }

    _createDefaultLogger() {
        const logger = {
            info: (msg) => console.log(`[EnvValidator] ${msg}`),
            warning: (msg) => console.warn(`[EnvValidator] ${msg}`),
            error: (msg) => console.error(`[EnvValidator] ${msg}`)
        };
        return logger;
    }

    _findLuaPath() {
        let current = __dirname;
        if (fs.existsSync(path.join(current, 'lua', 'env_validation.lua'))) {
            return path.join(current, 'lua');
        }

        let parent = path.join(current, '..');
        if (fs.existsSync(path.join(parent, 'env-validation', 'lua', 'env_validation.lua'))) {
            return path.join(parent, 'env-validation', 'lua');
        }

        return path.join(current, 'lua');
    }

    _loadLuaModules() {
        this.L = lauxlib.luaL_newstate();
        lualib.luaL_openlibs(this.L);

        const normalizedPath = this.luaPath.replace(/\\/g, '/');
        lua.lua_getglobal(this.L, 'package');
        lua.lua_getfield(this.L, -1, 'path');
        const currentPathStr = lua.lua_tostring(this.L, -1);
        const currentPath = currentPathStr ? to_jsstring(currentPathStr) : '';
        lua.lua_pop(this.L, 1);
        const newPath = currentPath + ';' + normalizedPath + '/?.lua';
        lua.lua_pushstring(this.L, to_luastring(newPath));
        lua.lua_setfield(this.L, -2, 'path');
        lua.lua_pop(this.L, 1);

        const validatorsCode = fs.readFileSync(
            path.join(this.luaPath, 'validators.lua'),
            'utf8'
        );
        const schemaLoaderCode = fs.readFileSync(
            path.join(this.luaPath, 'schema_loader.lua'),
            'utf8'
        );
        const envValidationCode = fs.readFileSync(
            path.join(this.luaPath, 'env_validation.lua'),
            'utf8'
        );

        const loadResult1 = lauxlib.luaL_loadstring(this.L, to_luastring(validatorsCode));
        if (loadResult1 !== 0) {
            let errorMsg = 'Unknown error';
            const top = lua.lua_gettop(this.L);
            if (top > 0) {
                const errorType = lua.lua_type(this.L, -1);
                if (errorType === lua.LUA_TSTRING) {
                    const str = lua.lua_tostring(this.L, -1);
                    if (str !== null) {
                        errorMsg = to_jsstring(str);
                    }
                }
                lua.lua_pop(this.L, 1);
            }
            throw new Error(`Failed to load validators.lua: ${errorMsg}`);
        }
        const callResult1 = lua.lua_pcall(this.L, 0, 0, 0);
        if (callResult1 !== 0) {
            let errorMsg = 'Unknown error';
            const top = lua.lua_gettop(this.L);
            if (top > 0) {
                const errorType = lua.lua_type(this.L, -1);
                if (errorType === lua.LUA_TSTRING) {
                    const str = lua.lua_tostring(this.L, -1);
                    if (str !== null) {
                        errorMsg = to_jsstring(str);
                    }
                }
                lua.lua_pop(this.L, 1);
            }
            throw new Error(`Failed to execute validators.lua: ${errorMsg}`);
        }
        
        const loadResult2 = lauxlib.luaL_loadstring(this.L, to_luastring(schemaLoaderCode));
        if (loadResult2 !== 0) {
            let errorMsg = 'Unknown error';
            const top = lua.lua_gettop(this.L);
            if (top > 0) {
                const errorType = lua.lua_type(this.L, -1);
                if (errorType === lua.LUA_TSTRING) {
                    const str = lua.lua_tostring(this.L, -1);
                    if (str !== null) {
                        errorMsg = to_jsstring(str);
                    }
                }
                lua.lua_pop(this.L, 1);
            }
            throw new Error(`Failed to load schema_loader.lua: ${errorMsg}`);
        }
        const callResult2 = lua.lua_pcall(this.L, 0, 0, 0);
        if (callResult2 !== 0) {
            let errorMsg = 'Unknown error';
            const top = lua.lua_gettop(this.L);
            if (top > 0) {
                const errorType = lua.lua_type(this.L, -1);
                if (errorType === lua.LUA_TSTRING) {
                    const str = lua.lua_tostring(this.L, -1);
                    if (str !== null) {
                        errorMsg = to_jsstring(str);
                    }
                }
                lua.lua_pop(this.L, 1);
            }
            throw new Error(`Failed to execute schema_loader.lua: ${errorMsg}`);
        }
        
        const loadResult3 = lauxlib.luaL_loadstring(this.L, to_luastring(envValidationCode));
        if (loadResult3 !== 0) {
            let errorMsg = 'Unknown error';
            const top = lua.lua_gettop(this.L);
            if (top > 0) {
                const errorType = lua.lua_type(this.L, -1);
                if (errorType === lua.LUA_TSTRING) {
                    const str = lua.lua_tostring(this.L, -1);
                    if (str !== null) {
                        errorMsg = to_jsstring(str);
                    }
                }
                lua.lua_pop(this.L, 1);
            }
            throw new Error(`Failed to load env_validation.lua: ${errorMsg}`);
        }
        const callResult3 = lua.lua_pcall(this.L, 0, 0, 0);
        if (callResult3 !== 0) {
            let errorMsg = 'Unknown error';
            const top = lua.lua_gettop(this.L);
            if (top > 0) {
                const errorType = lua.lua_type(this.L, -1);
                if (errorType === lua.LUA_TSTRING) {
                    const str = lua.lua_tostring(this.L, -1);
                    if (str !== null) {
                        errorMsg = to_jsstring(str);
                    }
                }
                lua.lua_pop(this.L, 1);
            }
            throw new Error(`Failed to execute env_validation.lua: ${errorMsg}`);
        }
    }

    _luaValueToJs(L, index) {
        const type = lua.lua_type(L, index);
        
        if (type === lua.LUA_TNIL) {
            return null;
        } else if (type === lua.LUA_TBOOLEAN) {
            return lua.lua_toboolean(L, index);
        } else if (type === lua.LUA_TNUMBER) {
            return lua.lua_tonumber(L, index);
        } else if (type === lua.LUA_TSTRING) {
            const str = lua.lua_tostring(L, index);
            return str ? to_jsstring(str) : '';
        } else if (type === lua.LUA_TTABLE) {
            return this._luaTableToObject(L, index);
        } else {
            return null;
        }
    }

    _luaTableToObject(L, index) {
        const result = {};
        const absIndex = lua.lua_absindex(L, index);
        
        lua.lua_pushnil(L);
        while (lua.lua_next(L, absIndex) !== 0) {
            const key = this._luaValueToJs(L, -2);
            const value = this._luaValueToJs(L, -1);
            result[String(key)] = value;
            lua.lua_pop(L, 1);
        }
        
        return result;
    }

    _jsValueToLua(L, value) {
        if (value === null || value === undefined) {
            lua.lua_pushnil(L);
        } else if (typeof value === 'boolean') {
            lua.lua_pushboolean(L, value);
        } else if (typeof value === 'number') {
            lua.lua_pushnumber(L, value);
        } else if (typeof value === 'string') {
            lua.lua_pushstring(L, to_luastring(value));
        } else if (Array.isArray(value)) {
            lua.lua_createtable(L, value.length, 0);
            value.forEach((item, i) => {
                this._jsValueToLua(L, item);
                lua.lua_rawseti(L, -2, i + 1);
            });
        } else if (typeof value === 'object') {
            lua.lua_createtable(L, 0, Object.keys(value).length);
            for (const [key, val] of Object.entries(value)) {
                lua.lua_pushstring(L, to_luastring(String(key)));
                this._jsValueToLua(L, val);
                lua.lua_settable(L, -3);
            }
        } else {
            lua.lua_pushstring(L, to_luastring(String(value)));
        }
    }

    validate(schema, envVars = null) {
        if (envVars === null) {
            // eslint-disable-next-line no-restricted-syntax
            envVars = process.env;
        }

        let schemaKeys = [];
        let schemaLua;
        if (typeof schema === 'string') {
            try {
                const schemaContent = fs.readFileSync(schema, 'utf8');
                const schemaDict = JSON.parse(schemaContent);
                schemaKeys = Object.keys(schemaDict);
                schemaLua = schemaDict;
            } catch (e) {
                schemaLua = schema;
            }
        } else {
            schemaKeys = Object.keys(schema);
            schemaLua = schema;
        }

        const loadResult = lauxlib.luaL_loadstring(this.L, to_luastring('return require("env_validation")'));
        if (loadResult !== 0) {
            const errorStr = lua.lua_tostring(this.L, -1);
            const error = errorStr ? to_jsstring(errorStr) : 'Unknown error';
            lua.lua_pop(this.L, 1);
            throw new Error(`Failed to load require statement: ${error}`);
        }
        
        const callResult = lua.lua_pcall(this.L, 0, 1, 0);
        if (callResult !== 0) {
            const errorStr = lua.lua_tostring(this.L, -1);
            const error = errorStr ? to_jsstring(errorStr) : 'Unknown error';
            lua.lua_pop(this.L, 1);
            throw new Error(`Failed to require env_validation: ${error}`);
        }
        
        if (lua.lua_type(this.L, -1) === lua.LUA_TNIL) {
            lua.lua_pop(this.L, 1);
            throw new Error('env_validation module returned nil');
        }
        
        lua.lua_getfield(this.L, -1, 'validate');
        if (lua.lua_type(this.L, -1) === lua.LUA_TNIL) {
            lua.lua_pop(this.L, 2);
            throw new Error('validate function not found in env_validation module');
        }
        
        this._jsValueToLua(this.L, schemaLua);
        this._jsValueToLua(this.L, envVars);
        
        const validateCallResult = lua.lua_pcall(this.L, 2, 1, 0);
        if (validateCallResult !== 0) {
            const errorStr = lua.lua_tostring(this.L, -1);
            const error = errorStr ? to_jsstring(errorStr) : 'Unknown error';
            lua.lua_pop(this.L, 1);
            throw new Error(`Lua validation error: ${error}`);
        }

        const result = this._luaValueToJs(this.L, -1);
        lua.lua_pop(this.L, 1);

        const resultObj = result || {};

        const readVars = schemaKeys.filter(k => k in envVars);
        const validatedVars = resultObj.valid ? Object.keys(resultObj.values || {}) : [];
        const missingVars = schemaKeys.filter(k => !(k in envVars));
        
        // Ensure errors is always an array
        let errors = [];
        if (resultObj.errors) {
            if (Array.isArray(resultObj.errors)) {
                errors = resultObj.errors;
            } else if (typeof resultObj.errors === 'object') {
                // Convert object to array
                errors = Object.values(resultObj.errors);
            }
        }

        if (readVars.length > 0) {
            this.logger.info(`Read ${readVars.length} variables: ${readVars.join(', ')}`);
        }
        if (validatedVars.length > 0) {
            this.logger.info(`Validated ${validatedVars.length} variables: ${validatedVars.join(', ')}`);
        }
        if (missingVars.length > 0) {
            this.logger.warning(`Missing ${missingVars.length} variables from schema: ${missingVars.join(', ')}`);
        }
        if (errors.length > 0) {
            this.logger.error(`Validation failed with ${errors.length} errors`);
            errors.forEach(err => {
                if (err && typeof err === 'object') {
                    this.logger.error(`  ${err.variable || 'unknown'}: ${err.error || 'unknown error'}`);
                }
            });
        }

        // Ensure errors is always an array in the returned object
        resultObj.errors = errors;
        
        return resultObj;
    }

    validateOrError(schema, envVars = null) {
        const result = this.validate(schema, envVars);

        if (!result.valid) {
            const errorMessages = result.errors
                .map(err => {
                    if (err && typeof err === 'object') {
                        return `${err.variable || 'unknown'}: ${err.error || 'unknown error'}`;
                    }
                    return String(err);
                })
                .join('\n');
            
            throw new Error(
                'Environment variable validation failed:\n' + errorMessages
            );
        }

        return result.values;
    }
}

module.exports = {
    EnvValidator
};

