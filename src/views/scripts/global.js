const GET_CHILD_DIV_QUERY = '>div:first';

/**
 * 
 * @param {string} titulo 
 * @param {map} filtros 
 * @param {string} appendTo 
 * @param {boolean} hide 
 * @returns referencia para elemento cabeçalho adicionado
 */
function insertHeader_Global(titulo, filtros, appendTo, hide = false) {

    return fetch(`${baseURL}/v1/commonComponent/header`, {
        method: "POST",
        headers: myheaders,
        body: JSON.stringify({
            titulo: titulo,
            filtros: filtros,
        }),
    })
        .then((result) => {
            return result.text();
        })
        .then((text) => {
            appendTo = $(appendTo);
            appendTo.prepend(text);

            const ref = appendTo.find(GET_CHILD_DIV_QUERY);

            // console.log(ref);

            if (hide) {
                ref.attr("hidden", "true");
            }

            return ref;
        });
}

/**
 * 
 * @param {string} appendTo 
 * @param {boolean} hide 
 * @returns referencia para elemento footer adicionado
 */
function insertFooter_Global(appendTo, hide = false) {
    return fetch(`${baseURL}/v1/commonComponent/footer`, {
        method: "GET",
        headers: myheaders,
    })
        .then((result) => {
            return result.text();
        })
        .then((text) => {
            appendTo = $(appendTo);
            appendTo.prepend(text);

            const ref = appendTo.find(GET_CHILD_DIV_QUERY);

            if (hide) {
                ref.attr("hidden", "true");
            }

            return ref;
        });
}