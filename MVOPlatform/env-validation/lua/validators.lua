--[[
    Validators for environment variables
    Implements JOI-like validations for different data types
]]

local M = {}

--[[
    Validates a field according to its schema
    
    @param var_name string - Variable name
    @param value string|nil - Value to validate
    @param schema table - Validation schema
    @return table - {valid: boolean, value: any, error: string|nil}
]]
function M.validate_field(var_name, value, schema)
    -- Check if required
    if schema.required ~= false and (value == nil or value == "") then
        return {
            valid = false,
            error = "Required variable not found"
        }
    end
    
    -- If not required and no value, use default
    if (value == nil or value == "") and schema.default ~= nil then
        value = schema.default
    end
    
    -- If not required and no value or default, return nil
    if (value == nil or value == "") and schema.required == false then
        return {
            valid = true,
            value = nil
        }
    end
    
    -- Validate type
    local type_validator = M.get_type_validator(schema.type)
    if not type_validator then
        return {
            valid = false,
            error = string.format("Unknown validation type: %s", schema.type)
        }
    end
    
    local type_result = type_validator(value, schema)
    if not type_result.valid then
        return type_result
    end
    
    -- Apply additional validations
    local validated_value = type_result.value
    
    -- Validate enum (safe access)
    if schema.enum ~= nil then
        local enum_result = M.validate_enum(validated_value, schema.enum)
        if not enum_result.valid then
            return enum_result
        end
    end
    
    -- Validate min/max for strings and numbers (min and max are independent)
    if schema.type == "string" and schema.min_length then
        if #validated_value < schema.min_length then
            return {
                valid = false,
                error = string.format("Must have at least %d characters", schema.min_length)
            }
        end
    end
    
    if schema.type == "string" and schema.max_length then
        if #validated_value > schema.max_length then
            return {
                valid = false,
                error = string.format("Must have at most %d characters", schema.max_length)
            }
        end
    end
    
    -- Validate min for numbers (independent of max)
    if (schema.type == "number" or schema.type == "integer") and schema.min ~= nil then
        if validated_value < schema.min then
            return {
                valid = false,
                error = string.format("Must be greater than or equal to %s", tostring(schema.min))
            }
        end
    end
    
    -- Validate max for numbers (independent of min)
    if (schema.type == "number" or schema.type == "integer") and schema.max ~= nil then
        if validated_value > schema.max then
            return {
                valid = false,
                error = string.format("Must be less than or equal to %s", tostring(schema.max))
            }
        end
    end
    
    -- Validate pattern (regex) (safe access)
    if schema.pattern ~= nil then
        local pattern_result = M.validate_pattern(validated_value, schema.pattern)
        if not pattern_result.valid then
            return pattern_result
        end
    end
    
    return {
        valid = true,
        value = validated_value
    }
end

--[[
    Gets the validator according to the type
    
    @param type_name string - Type name
    @return function|nil - Validator function
]]
function M.get_type_validator(type_name)
    local validators = {
        string = M.validate_string,
        number = M.validate_number,
        integer = M.validate_integer,
        boolean = M.validate_boolean,
        url = M.validate_url,
        email = M.validate_email,
        json = M.validate_json
    }
    
    return validators[type_name]
end

--[[
    Validates a string
]]
function M.validate_string(value, schema)
    if type(value) ~= "string" then
        return {
            valid = false,
            error = "Must be a string"
        }
    end
    
    return {
        valid = true,
        value = value
    }
end

--[[
    Validates a number
]]
function M.validate_number(value, schema)
    local num = tonumber(value)
    if num == nil then
        return {
            valid = false,
            error = "Must be a valid number"
        }
    end
    
    return {
        valid = true,
        value = num
    }
end

--[[
    Validates an integer
]]
function M.validate_integer(value, schema)
    local num = tonumber(value)
    if num == nil then
        return {
            valid = false,
            error = "Must be a valid integer"
        }
    end
    
    if math.floor(num) ~= num then
        return {
            valid = false,
            error = "Must be an integer"
        }
    end
    
    return {
        valid = true,
        value = math.floor(num)
    }
end

--[[
    Validates a boolean
]]
function M.validate_boolean(value, schema)
    local str = string.lower(tostring(value))
    
    if str == "true" or str == "1" or str == "yes" or str == "on" then
        return {
            valid = true,
            value = true
        }
    elseif str == "false" or str == "0" or str == "no" or str == "off" then
        return {
            valid = true,
            value = false
        }
    else
        return {
            valid = false,
            error = "Must be a valid boolean (true/false, 1/0, yes/no, on/off)"
        }
    end
end

--[[
    Validates a URL
]]
function M.validate_url(value, schema)
    -- More permissive URL pattern supporting http, https, ftp, file, and other protocols
    -- Pattern breakdown:
    -- ^[%w%+%-%.]+://  - Protocol (http, https, ftp, file, etc.)
    -- [%w%-_%.]+       - Domain or hostname (at least one character)
    -- [%w%-_%.%:]*     - Optional port (colon followed by digits)
    -- [%w%-_%.%?%#%=&/%%]* - Path, query, fragment (various URL components)
    local url_pattern = "^[%w%+%-%.]+://[%w%-_%.]+[%w%-_%.%:]*[%w%-_%.%?%#%=&/%%]*$"
    
    if not string.match(value, url_pattern) then
        return {
            valid = false,
            error = "Must be a valid URL"
        }
    end
    
    return {
        valid = true,
        value = value
    }
end

--[[
    Validates an email
]]
function M.validate_email(value, schema)
    -- Basic email pattern
    local email_pattern = "^[%w%._%-]+@[%w%._%-]+%.%w+$"
    
    if not string.match(value, email_pattern) then
        return {
            valid = false,
            error = "Must be a valid email"
        }
    end
    
    return {
        valid = true,
        value = value
    }
end

--[[
    Validates JSON
]]
function M.validate_json(value, schema)
    -- Try to parse as JSON (requires external library or simple implementation)
    -- For now, we only validate that it's a string
    if type(value) ~= "string" then
        return {
            valid = false,
            error = "Must be a valid JSON string"
        }
    end
    
    -- Basic validation: must start with { or [
    if not (string.match(value, "^%s*[%[%{]") or string.match(value, "^%s*\"[^\"]+\"") or string.match(value, "^%s*%d+")) then
        return {
            valid = false,
            error = "Must be valid JSON"
        }
    end
    
    return {
        valid = true,
        value = value
    }
end

--[[
    Validates that the value is in the list of allowed values
]]
function M.validate_enum(value, enum_list)
    for _, allowed_value in ipairs(enum_list) do
        if tostring(value) == tostring(allowed_value) then
            return {
                valid = true,
                value = value
            }
        end
    end
    
    return {
        valid = false,
        error = string.format("Must be one of: %s", table.concat(enum_list, ", "))
    }
end

--[[
    Validates a regex pattern
]]
function M.validate_pattern(value, pattern)
    if not string.match(value, pattern) then
        return {
            valid = false,
            error = "Does not match the required pattern"
        }
    end
    
    return {
        valid = true,
        value = value
    }
end

return M

