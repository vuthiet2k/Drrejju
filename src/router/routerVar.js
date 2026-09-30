import ALL_ROUTER_APP from '@/router/routes.js'


const systemBelong = "systemManage"
const dataManageBelong = "dataManage"
const manageBelong = "manage"

const listRouterSystem = ALL_ROUTER_APP.filter(router => {
    return router.meta?.belongTo === systemBelong
})


const listRouterDataManage = ALL_ROUTER_APP.filter(router => {
    return router.meta?.belongTo === dataManageBelong
})


const listRouterManage = ALL_ROUTER_APP.filter(router => {
    return router.meta?.belongTo === manageBelong
})

function getListMainPage() {
    const listMainSystemRouter = listRouterSystem.filter(router => {
        return router.meta?.showMenu
    })
    const listMainDataManageRouter = listRouterDataManage.filter(router => {
        return router.meta?.showMenu
    })
    const listMainManageRouter = listRouterManage.filter(router => {
        return router.meta?.showMenu
    })
    const rl = [
        {
            title: 'Dữ liệu & Bản đồ',
            listPage: listMainDataManageRouter
        },
        {
            title: 'Hợp tác xã & Vùng sản xuất',
            listPage: listMainManageRouter
        },
        {
            title: 'Hệ thống',
            listPage: listMainSystemRouter
        }
    ]
    return rl


}

function getMenuCurrentPage() {
    const path = location.pathname
    const firstPath = path.split("/")[1]
    const secondPath = path.split("/")[2]
    const checkPath = `/${firstPath}/${secondPath}`
    let rlMenu = ALL_ROUTER_APP.filter(router => {
        return router.path.startsWith(checkPath)
    })
    rlMenu = formatMenuVer2(rlMenu)
    return rlMenu
}


function formatMenu(listMenu) {
    console.log("FORMAT MENU 1")
    let mainMenu = null
    let subMenu = []
    let formatedMenu = {}
    if (listMenu.length > 1) {
        listMenu.forEach(menu => {
            if (menu.meta.showMenu) {
                mainMenu = menu
            } else if (menu.meta.showNavSubMenu) {
                subMenu.push(menu)
            }
        })
        formatedMenu = {
            ...mainMenu,
            "subMenu": subMenu
        }
    }
    else {
        formatedMenu = {
            ...listMenu[0],
            "subMenu": []
        }
    }
    return formatedMenu
}

function formatMenuVer2(listMenu) {
    console.log("FORMAT MENU 2")
    let menus = listMenu.filter(menu => menu.meta.showMenu)
    if (listMenu.length > 0) {
        menus = menus.map(obj => {
            const submenu = listMenu.filter(menu => {
                // const equalPath = menu.path.startsWith(obj.path)
                const equalBelongTo = menu.meta.belongTo == obj.meta.belongTo
                const isSubMenu = menu.meta.showNavSubMenu
                // const isNotShowMenu = !menu.meta.showMenu

                // if (equalPath && equalBelongTo && isSubMenu && isNotShowMenu) {
                //     return true
                // }
                if (equalBelongTo && isSubMenu) {
                    return true
                }
                return false
            })
            return { ...obj, subMenu: submenu }
        })
    }
    else {
        menus = [{...listMenu[0], subMenu: []}]
    }
    return menus
}

export {
    getListMainPage,
    getMenuCurrentPage,
    formatMenu
}