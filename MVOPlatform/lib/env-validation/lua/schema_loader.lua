--[[
    Schema loader from JSON files
    Allows loading portable schemas from JSON files
]]

local M = {}

--[[
    Loads a schema from a JSON file
    
    @param file_path string - Path to JSON file
    @return table - Loaded and validated schema
]]
function M.load_from_file(file_path)
    local file = io.open(file_path, "r")
    if not file then
        error(string.format("Could not open file: %s", file_path))
    end
    
    local content = file:read("*all")
    file:close()
    
    -- Parse JSON (simple implementation or use external library)
    local schema = M.parse_json(content)
    
    return M.validate_schema(schema)
end

--[[
    Validates the structure of a schema
    
    @param schema table - Schema to validate
    @return table - Validated schema
]]
function M.validate_schema(schema)
    if type(schema) ~= "table" then
        error("Schema must be a table")
    end
    
    for var_name, var_schema in pairs(schema) do
        if type(var_schema) ~= "table" then
            error(string.format("Schema for '%s' must be a table", var_name))
        end
        
        if not var_schema.type then
            error(string.format("Schema for '%s' must have a type defined", var_name))
        end
        
        -- Validate that the type is valid
        local valid_types = {
            string = true,
            number = true,
            integer = true,
            boolean = true,
            url = true,
            email = true,
            json = true
        }
        
        if not valid_types[var_schema.type] then
            error(string.format("Invalid type '%s' for variable '%s'", var_schema.type, var_name))
        end
    end
    
    return schema
end

--[[
    Simple JSON parser (basic implementation)
    For production, it's recommended to use an external JSON library like dkjson or cjson
    
    @param json_string string - JSON string to parse
    @return table - Parsed Lua table
]]
function M.parse_json(json_string)
    -- This is a very basic implementation
    -- For production, use a library like:
    -- - dkjson (https://github.com/dhkmoon/dkjson)
    -- - cjson (requires LuaJIT or Lua with C module)
    -- - json.lua (pure Lua implementation)
    
    -- For now, we assume the user can use an external library
    -- or provide the schema as a Lua table directly
    
    -- Try to load dkjson if available
    local ok, json = pcall(require, "dkjson")
    if ok then
        return json.decode(json_string)
    end
    
    -- Try to load cjson if available
    ok, json = pcall(require, "cjson")
    if ok then
        return json.decode(json_string)
    end
    
    -- If no JSON library available, try basic parsing
    -- Only for simple schemas
    return M.simple_json_parse(json_string)
end

--[[
    Simple JSON parser for basic schemas
    Only works with very simple JSON, without complex nested arrays
]]
function M.simple_json_parse(json_string)
    -- Remove spaces and line breaks
    json_string = string.gsub(json_string, "%s+", " ")
    json_string = string.gsub(json_string, "^%s+", "")
    json_string = string.gsub(json_string, "%s+$", "")
    
    -- Verify it starts and ends with {}
    if not (string.match(json_string, "^%s*{") and string.match(json_string, "}%s*$")) then
        error("Invalid JSON: must be an object")
    end
    
    -- Remove outer braces
    json_string = string.match(json_string, "{(.*)}")
    
    local result = {}
    local pos = 1
    
    while pos <= #json_string do
        -- Find key
        local key_start = string.find(json_string, '"', pos)
        if not key_start then break end
        
        local key_end = string.find(json_string, '"', key_start + 1)
        if not key_end then break end
        
        local key = string.sub(json_string, key_start + 1, key_end - 1)
        pos = key_end + 1
        
        -- Find :
        pos = string.find(json_string, ":", pos) or (#json_string + 1)
        pos = pos + 1
        
        -- Find value
        local value_start = pos
        local value_end
        
        -- If it's a string
        if string.sub(json_string, value_start, value_start) == '"' then
            value_start = value_start + 1
            value_end = string.find(json_string, '"', value_start)
            if not value_end then break end
            result[key] = string.sub(json_string, value_start, value_end - 1)
            pos = value_end + 1
        -- If it's a number
        elseif string.match(string.sub(json_string, value_start, value_start), "%d") then
            value_end = string.find(json_string, "[,}]", value_start) or (#json_string + 1)
            local num_str = string.match(string.sub(json_string, value_start, value_end - 1), "%-?%d+%.?%d*")
            if num_str then
                result[key] = tonumber(num_str)
            end
            pos = value_end
        -- If it's a boolean
        elseif string.sub(json_string, value_start, value_start + 3) == "true" then
            result[key] = true
            pos = value_start + 4
        elseif string.sub(json_string, value_start, value_start + 4) == "false" then
            result[key] = false
            pos = value_start + 5
        -- If it's null
        elseif string.sub(json_string, value_start, value_start + 3) == "null" then
            result[key] = nil
            pos = value_start + 4
        -- If it's a nested object (simplified)
        elseif string.sub(json_string, value_start, value_start) == "{" then
            -- For nested objects, we would need recursion
            -- For now, skip
            local brace_count = 1
            pos = value_start + 1
            while pos <= #json_string and brace_count > 0 do
                if string.sub(json_string, pos, pos) == "{" then
                    brace_count = brace_count + 1
                elseif string.sub(json_string, pos, pos) == "}" then
                    brace_count = brace_count - 1
                end
                pos = pos + 1
            end
        -- If it's an array (simplified)
        elseif string.sub(json_string, value_start, value_start) == "[" then
            local bracket_count = 1
            pos = value_start + 1
            while pos <= #json_string and bracket_count > 0 do
                if string.sub(json_string, pos, pos) == "[" then
                    bracket_count = bracket_count + 1
                elseif string.sub(json_string, pos, pos) == "]" then
                    bracket_count = bracket_count - 1
                end
                pos = pos + 1
            end
        end
        
        -- Find next field or end
        pos = string.find(json_string, ",", pos) or (#json_string + 1)
        if pos <= #json_string then
            pos = pos + 1
        end
    end
    
    return result
end

return M

