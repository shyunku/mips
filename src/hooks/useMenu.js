const { useState, useMemo } = require("react");

const useMenu = (menus, initialMenuKey = null, onMenuChange = null) => {
  const [selectedMenuKey, setSelectedMenuKey] = useState(initialMenuKey ?? menus[0]?.key ?? null);
  const menuList = useMemo(() => {
    return (menus ?? []).map((menu) => {
      const onClick = () => {
        setSelectedMenuKey(menu?.key);
        menu?.onClick?.();
        onMenuChange?.(menu?.key);
      };
      return {
        ...menu,
        onClick,
      };
    });
  }, [menus, onMenuChange]);

  const setMenu = (key) => {
    setSelectedMenuKey(key);
    onMenuChange?.(key);
  };

  return {
    key: selectedMenuKey,
    menus: menuList,
    setMenu,
  };
};

export default useMenu;
