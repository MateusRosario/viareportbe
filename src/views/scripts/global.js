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

function isElementoVisivel_Global(el) {
    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

function elementoVisivelState_Global(el, callback) {
    var old_visible;
    return function () {
        var visible = isElementoVisivel_Global(el);
        if (visible != old_visible) {
            old_visible = visible;
            if (typeof callback == 'function') {
                callback();
            }
        }
    }
}

    
/**
 * Recebe data (AAAA-MM-DD), hora e minutos e retorna no formato ISOString
**/
function formatDateToAPI_Global(date, hour, minute) {
    let _date = new Date(date);
    _date.setUTCHours(hour, minute);

    return _date.toISOString();
}

/**
 * recebe data string no formato "AAAA-MM-DDTHH:mm:ss" e retorna data no formato "DD/MM/AAAA"
**/
function formatDateToLocal_Global(datestring) {
    let _array = datestring.split("T")[0].split("-");
    let retorno = _array[2] + "/" + _array[1] + "/" + _array[0];
    return retorno;
};

/**
 * Função para formatar números para Real => R$ 00,00
 */
const formatMoeda_Global = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
