#!/usr/bin/env bash
source manage-secrets.sh
fzf_menu() ( set +e; return 1; )
if ! target=$(fzf_menu "test"); then
    [[ $- == *e* ]] && echo "STILL_STRICT"
fi
