--[[
    ChanchitoTools.EnvValidation
    Portable library for environment variable validation using JOI-like schemas
    
    Usage:
        local env = require("env_validation")
        local schema = env.load_schema("schema.json")
        local result = env.validate(schema)
        if result.valid then
            print("Valid variables:", result.values)
        else
            print("Errors:", result.errors)
        end
]]

local validators = require("validators")
local schema_loader = require("schema_loader")

local M = {}

--[[
    Validates environment variables according to a schema
    
    @param schema table|string - Validation schema (Lua table or path to JSON file)
    @param env_vars table - Optional table of environment variables (defaults to os.getenv)
    @return table - Result with {valid: boolean, values: table, errors: table}
]]
function M.validate(schema, env_vars)
    env_vars = env_vars or {}
    
    -- Load schema if it's a string (file path)
    if type(schema) == "string" then
        schema = schema_loader.load_from_file(schema)
    end
    
    -- If env_vars not provided, read from system
    if next(env_vars) == nil then
        for key, _ in pairs(schema) do
            local value = os.getenv(key)
            if value ~= nil then
                env_vars[key] = value
            end
        end
    end
    
    local result = {
        valid = true,
        values = {},
        errors = {}
    }
    
    -- Validate each variable in the schema
    for var_name, var_schema in pairs(schema) do
        local value = env_vars[var_name]
        local validation_result = validators.validate_field(var_name, value, var_schema)
        
        if validation_result.valid then
            result.values[var_name] = validation_result.value
        else
            result.valid = false
            table.insert(result.errors, {
                variable = var_name,
                error = validation_result.error
            })
        end
    end
    
    return result
end

--[[
    Loads a schema from a JSON file
    
    @param file_path string - Path to the JSON schema file
    @return table - Loaded schema
]]
function M.load_schema(file_path)
    return schema_loader.load_from_file(file_path)
end

--[[
    Creates a schema from a Lua table
    
    @param schema_table table - Lua table with schema definition
    @return table - Validated schema
]]
function M.create_schema(schema_table)
    return schema_loader.validate_schema(schema_table)
end

--[[
    Validates and returns only valid values, throwing error if there are problems
    
    @param schema table|string - Validation schema
    @param env_vars table - Optional table of environment variables
    @return table - Table with validated values
    @raise error if validation fails
]]
function M.validate_or_error(schema, env_vars)
    local result = M.validate(schema, env_vars)
    
    if not result.valid then
        local error_messages = {}
        for _, err in ipairs(result.errors) do
            table.insert(error_messages, string.format("%s: %s", err.variable, err.error))
        end
        error("Environment variable validation failed:\n" .. table.concat(error_messages, "\n"))
    end
    
    return result.values
end

return M

