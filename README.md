# Unofficial Carvana Inventory Search API
## History
I wanted to research vehicles for sale on [Carvana](https://carvana.com) and didn't like the paging options. Their page response time was a little low for my liking on the pagination, and every time you wanted to open a vehicle in a different tab, it would redirect on your original page as well.

## Requirements
Node 8.x

## Instructions to Run
`node start`

## Caveats
The design of the enums for filtering options isn't intuitive - each enumeration is a unique identifier rather than passing an array up.

## Todos
[] Async lookups across multiple pages instead of condensing to a single page
[] Additional filter types
[] Convert to ES Modules

## Disclaimer
This is by no means in complete parity. Use at your own risk. External API is liable to change at any time without notice. **DO NOT ABUSE THEIR API.**
