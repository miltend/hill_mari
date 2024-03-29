// with this we make js less forgiving so that we catch
// more hidden errors during development
'use strict';


// https://stackoverflow.com/a/196991
function to_title_case(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}


function build_search_index(record_numbers, records, keys) {
    let search_index = new JsSearch.Search('record');
    // https://github.com/bvaughn/js-search#configuring-the-index-strategy
    search_index.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
    for (let key of keys) {
        search_index.addIndex(key);
    }
    for (let record_number of record_numbers) {
        search_index.addDocuments([records[record_number]]);
    }
    return search_index;
}


function collect_options(record_numbers, records, key, is_list) {
    let s = new Set();
    for (let record_number of record_numbers) {
        if (is_list) {
            for (let element of records[record_number][key]) {
                if (element != null) {
                    s.add(element);
                }
            }
        } else {
            let element = records[record_number][key];
            if (element != null) {
                s.add(element);
            }
        }
    }

    let items = Array.from(s);
    items.sort();

    let tree = [];
    for (let element of items) {
        tree.push({
            id: element,
            label: element
        });
    }

    return tree;
}


function object_is_empty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


// translates array to list of items
function _helper(array) {
    let tree = [];

    let keys = [];
    for (let prop in array) {
        keys.push(prop);
    }
    keys.sort();

    for (let prop of keys) {
        if (Object.prototype.hasOwnProperty.call(array, prop)) {
            if (object_is_empty(prop)) {
                tree.push({
                    id: prop,
                    label: prop,
                });
            } else {
                tree.push({
                    id: prop,
                    label: prop,
                    children: _helper(array[prop]),
                });
            }
        }
    }

    return tree;
}


function collect_options_tree(record_numbers, records, key) {
    // first we build up a simpler array tree from all entries
    let tree_array = {};
    for (let record_number of record_numbers) {
        if (records[record_number][key] != null) {
            for (let element_0 of records[record_number][key]) {
                let type_0 = element_0["type"];
                if (!(type_0 in tree_array)) {
                    tree_array[type_0] = {};
                }
                if ("subtypes" in element_0) {
                    for (let element_1 of element_0["subtypes"]) {
                        let type_1 = element_1["type"];
                        if (!(type_1 in tree_array[type_0])) {
                            tree_array[type_0][type_1] = {};
                        }
                        if ("subtypes" in element_1) {
                            for (let element_2 of element_1["subtypes"]) {
                                let type_2 = element_2["type"];
                                if (!(type_2 in tree_array[type_0][type_1])) {
                                    tree_array[type_0][type_1][type_2] = {};
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // in the second step we translate this to a structure required by https://vue-treeselect.js.org/
    let tree = _helper(tree_array);

    return tree;
}


// function arrange_glosses(illustration, gloss) {
//     const words = illustration.split(" ");
//     const glosses = gloss.split(" ");
//     const tbl = document.createElement('table');
//     // tbl.style.width = '100px';
//     // tbl.style.border = '1px solid white';
//
//     var tbdy = document.createElement('tbody');
//     for (var i = 0; i < 2; i++) {
//         var tr = document.createElement('tr');
//         if (i == 0) {
//             for (var j = 0; j < words.length; j++) {
//                 var td = document.createElement('td');
//                 td.appendChild(document.createTextNode(words[j]))
//                 tr.appendChild((td))
//             }
//
//         } else {
//             for (var j = 0; j < words.length; j++) {
//                 var td = document.createElement('td');
//                 td.appendChild(document.createTextNode(glosses[j]))
//                 tr.appendChild((td))
//             }
//         }
//         tbdy.appendChild(tr);
//     }
//     tbl.appendChild(tbdy);
//     console.log(tbl);
//     // var tg = document.getElementById('table_glosses')
//     return tbl
//
// }

// const tree = document.createDocumentFragment();

// var form_level = document.createElement("div")
// form_level.innerHTML = "Choose level:"

// var select_level = document.createElement("select")
// select_level.setAttribute("name", "level")
// select_level.setAttribute("id", "level")

// var array_levels = ["rus", "eng"]

// for (const ind in array_levels) {
//     let option = document.createElement("input")
//     option.setAttribute("type", "radio")
//     option.setAttribute("value", array_levels[ind])
//     // option.innerHTML = array_levels[ind]
//     let text = document.createElement("label")
//     text.setAttribute("for", array_levels[ind])

//     select_level.appendChild(option)
//     select_level.appendChild(text)
// }


// // var levels = document.getElementById("level")
// let level_button = document.createElement("input")
// level_button.setAttribute("type", "button")
// // choose_button.setAttribute("onclick", "choose_level()")
// level_button.setAttribute("value", "Choose")

// level_button.onclick = function() {
//     choose_level();
// };

// form_level.appendChild(select_level)
// form_level.appendChild(level_button)


// tree.append(form_level)
// document.getElementById("choose_lang").appendChild(tree)






function flatten_semantic_types(record_numbers, records) {
    let key = "semantic_types";

    // FIXME: this traversal is similar to function above
    for (let record_number of record_numbers) {
        let flattened_list = [];
        if (records[record_number][key] != null) {
            for (let element_0 of records[record_number][key]) {
                let type_0 = element_0["type"];
                flattened_list.push(type_0);
                if ("subtypes" in element_0) {
                    for (let element_1 of element_0["subtypes"]) {
                        let type_1 = element_1["type"];
                        flattened_list.push(type_1);
                        if ("subtypes" in element_1) {
                            for (let element_2 of element_1["subtypes"]) {
                                let type_2 = element_2["type"];
                                flattened_list.push(type_2);
                            }
                        }
                    }
                }
            }
        }
        records[record_number]["semantic_types_flat"] = flattened_list;
    }

    return records;
}


async function fetch_data(data, url_prefix) {
    // let r = await axios.get(url_prefix + 'data-combined-debug.yml');
    let r = await axios.get(url_prefix + 'data-combined.yml');
    let json_data = jsyaml.load(r.data);

    let records = {};
    let record_numbers = [];
    let levels = new Set();

    for (let key of Object.keys(json_data)) {
        records[key] = json_data[key];
        records[key].record = key;
        record_numbers.push(key);
    }

    data.records = records;
    data.record_numbers = record_numbers;

    data.levels = Array.from(levels);
    data.levels.sort();

    data.morphology_options = collect_options(data.record_numbers, data.records, 'morphology', true);
    data.syntactic_type_of_construction_options = collect_options(data.record_numbers, data.records, 'syntactic_type_of_construction', true);
    data.syntactic_function_of_anchor_options = collect_options(data.record_numbers, data.records, 'syntactic_function_of_anchor', true);
    data.syntactic_structure_of_anchor_options = collect_options(data.record_numbers, data.records, 'syntactic_structure_of_anchor', true);
    data.part_of_speech_of_anchor_options = collect_options(data.record_numbers, data.records, 'part_of_speech_of_anchor', true);

    data.semantic_types_options = collect_options_tree(data.record_numbers, data.records, 'semantic_types');

    // we need to flatten the semantic types tree for the search index
    // for some reason it does not pick up the options otherwise
    data.records = flatten_semantic_types(data.record_numbers, data.records);

    data.search_index = {};
    for (let key of ['name',
            'illustration',
            'morphology',
            'syntactic_type_of_construction',
            'syntactic_function_of_anchor',
            'syntactic_structure_of_anchor',
            'part_of_speech_of_anchor',
            'semantic_types_flat',
        ]) {
        data.search_index[key] = build_search_index(data.record_numbers, data.records, [key]);
    }

    data.all_data_loaded = true;
    data.show_data_spinner = false;
}


Vue.component('treeselect', VueTreeselect.Treeselect);


var app = new Vue({
    el: '#app',
    delimiters: ['{[', ']}'],
    data: {
        search_index: null,
        show_additional_information: false,
        show_data_spinner: true,
        all_data_loaded: false,
        current_record_number: null,
        record_numbers: [],
        record_numbers_matching_search: [],
        records: {},
        search_string: '',
        levels: [],
        morphology_options: [],
        morphology_selected: null,
        syntactic_type_of_construction_options: [],
        syntactic_type_of_construction_selected: null,
        syntactic_function_of_anchor_options: [],
        syntactic_function_of_anchor_selected: null,
        syntactic_structure_of_anchor_options: [],
        syntactic_structure_of_anchor_selected: null,
        part_of_speech_of_anchor_options: [],
        part_of_speech_of_anchor_selected: null,
        semantic_types_options: [],
        semantic_types_selected: null,
    },
    created: function() {
        this.show_data_spinner = true;
        fetch_data(this, 'https://raw.githubusercontent.com/constructicon/hill_mari-data/generated/');

        // https://lodash.com/docs#debounce
        this.search_debounced = _.debounce(this.search, 500);
        this.advanced_search_debounced = _.debounce(this.advanced_search, 500);
    },
    watch: {
        all_data_loaded: function(new_, old_) {
            // to make sure that when we load the page first time, we see all results
            this.search();
        },
        search_string: function(new_, old_) {
            this.search_debounced();
        },
        morphology_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        syntactic_type_of_construction_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        syntactic_function_of_anchor_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        syntactic_structure_of_anchor_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        part_of_speech_of_anchor_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
        semantic_types_selected: function(new_, old_) {
            this.advanced_search_debounced();
        },
    },
    methods: {
        // for x={'this': 'that'} returns 'this'
        key: function(x) {
            return Object.keys(x)[0];
        },
        // for x={'this': 'that'} returns 'that'
        value: function(x) {
            return x[Object.keys(x)[0]];
        },
        search: function() {
            let record_numbers_matching_search = [];

            if (this.search_string == '') {
                record_numbers_matching_search = this.record_numbers;
            } else {
                for (let key of ["name", "illustration"]) {
                    for (let result of this.search_index[key].search(this.search_string)) {
                        record_numbers_matching_search.push(result.record);
                    }
                }
            }

            record_numbers_matching_search = [...new Set(record_numbers_matching_search)];
            record_numbers_matching_search.sort((a, b) => a - b);
            this.record_numbers_matching_search = record_numbers_matching_search;
        },
        advanced_search: function() {
            let record_numbers_matching_search = [];

            let selected_options = {};
            selected_options['morphology'] = this.morphology_selected;
            selected_options['syntactic_type_of_construction'] = this.syntactic_type_of_construction_selected;
            selected_options['syntactic_function_of_anchor'] = this.syntactic_function_of_anchor_selected;
            selected_options['syntactic_structure_of_anchor'] = this.syntactic_structure_of_anchor_selected;
            selected_options['part_of_speech_of_anchor'] = this.part_of_speech_of_anchor_selected;
            selected_options['semantic_types_flat'] = this.semantic_types_selected;

            for (let key of [
                    'morphology',
                    'syntactic_type_of_construction',
                    'syntactic_function_of_anchor',
                    'syntactic_structure_of_anchor',
                    'part_of_speech_of_anchor',
                    'semantic_types_flat',
                ]) {
                if (selected_options[key] != null) {
                    let search_string = '"' + selected_options[key].join('" "') + '"';
                    for (let result of this.search_index[key].search(search_string)) {
                        record_numbers_matching_search.push(result.record);
                    }
                }
            }

            record_numbers_matching_search = [...new Set(record_numbers_matching_search)];
            record_numbers_matching_search.sort((a, b) => a - b);
            this.record_numbers_matching_search = record_numbers_matching_search;
        },
        arrange_glosses: function(illustration, gloss) {
            const diacritics = "¨ ̑".split(" ")
            console.log(diacritics)
            //¨ ̑
            let new_ill = "";
            let new_gloss = "";
            // const re = [a-zäöüə̈ə̑čšž];
            const il_words = illustration.split(" ");
            const gl_words = gloss.split(" ");
            if (il_words.length > gl_words.length) {
                let diff = il_words.length - gl_words.length
                for (let d = 0; d < diff; d++) {
                    gl_words.push(' ')
                }
            } else if (gl_words.length > il_words.length) {
                let diff = gl_words.length - il_words.length
                for (let d = 0; d < diff; d++) {
                    il_words.push(' ')
                }
            }
            // console.log(il_words, gl_words)
            for (let i = 0; i < il_words.length; i++) {
                if (il_words[i] == '-') {
                    gl_words.splice(i, 0, " ");
                    new_ill += il_words[i]
                    new_ill += " "
                    new_gloss += " "
                } else {
                    new_ill += il_words[i];
                    new_ill += " ";
                    new_gloss += gl_words[i];
                    new_gloss += " ";
                    if (il_words[i].length < gl_words[i].length) {
                        let difference = gl_words[i].length - il_words[i].length;
                        for (let di = 0; di < diacritics.length; di++) {
                            if (il_words.indexOf(diacritics[di]) > -1)
                            {
                                difference -= 1;
                                console.log('di!')

                            }
                        }
                        // console.log(difference, gl_words[i], il_words[i])

                        for (let j = 0; j < difference; j++) {
                            new_ill += " "
                        }

                    } else if (il_words[i].length > gl_words[i].length) {
                        let difference = il_words[i].length - gl_words[i].length;
                        for (let di = 0; di < diacritics.length; di++) {
                            if (il_words.indexOf(diacritics[di]) > -1)
                            {
                                difference += 1;
                                console.log('di!')

                            }
                        }
                        // console.log(difference, gl_words[i], il_words[i])

                        for (let j = 0; j < difference; j++) {
                            new_gloss += " "
                        }
                    }
                }
            }

            // console.log(new_ill)
            // console.log(new_gloss)

            return [new_ill, new_gloss]
        },
        split_gloss: function (gloss) {
            return gloss.split(" ")
        }
    }
})