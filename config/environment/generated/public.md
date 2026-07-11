# Public / Browser Environment Variables

Variables prefixed with `NEXT_PUBLIC_` are embedded in the client bundle. **Never place secrets here.**

| Variable                        | Description                                  | Scope          | Required | Secret | Default |
| ------------------------------- | -------------------------------------------- | -------------- | -------- | ------ | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL exposed to the browser. | public-runtime | Yes      | No     | —       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key exposed to the browser.    | public-runtime | Yes      | Yes    | —       |
