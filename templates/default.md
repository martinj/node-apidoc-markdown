# <%= project.name %> v<%= project.version %>

<%= project.description %>

<% _.each(files, function(file) { -%>
- <%= helpers.markdownLink(file) %>
<% _.each(sections[file], function(section) { -%>
  - <%= helpers.markdownLink(section.title) %>
<% }); -%>
<% }); -%>
<% if(prepend) { -%>

<%- prepend %>

<% } -%>
<% _.each(files, function(file) { -%>

# <%= file %>
<% _.each(sections[file], function(entry) { -%>

## <%= entry.title %>

<%- entry.description || "" %>

`<%- entry.type.toUpperCase() %> <%= entry.url %>`
<% var parameters = (entry.parameter && entry.parameter.fields.Parameter) || []; -%>
<% if(parameters.length) { -%>

### Parameters
| Name | Type | Description |
|------|------|-------------|
<% _.each(parameters, function(param) { -%>
| `<%- param.field %>` | _<%- param.type %>_ | <%= helpers.paramDescription(param) %> |
<% }); -%>
<% } -%>
<% var successParameters = (entry.success && entry.success.fields) -%>
<% if(successParameters) { -%>

### Success Parameters

<% _.each(successParameters, function(group, groupName) { -%>
#### <%= groupName %>
| Name | Type | Description |
|------|------|-------------|
<% _.each(group, function(param) { -%>
| `<%- param.field %>` | _<%- param.type %>_ | <%= helpers.paramDescription(param) %> |
<% }); -%>
<% }); -%>
<% } -%>
<% var examples = entry.examples || []; -%>
<% if(examples && examples.length) { -%>

### Examples

<% _.each(examples, function(example) { -%>
<%= example.title %>
```
<%- example.content %>
```
<% }); -%>
<% } -%>
<% var successExamples = (entry.success && entry.success.examples) || []; -%>
<% if(successExamples.length) { -%>

### Success Response

<% _.each(successExamples, function(example) { -%>
<%= example.title %>
```
<%- example.content %>
```
<% }); -%>
<% } -%>
<% var errorExamples = (entry.error && entry.error.examples) || []; -%>
<% if(errorExamples.length) { -%>

### Error Response

<% _.each(errorExamples, function(example) { -%>
<%= example.title %>
```
<%- example.content %>
```
<% }); -%>
<% } -%>
<% }); -%>
<% }); -%>
