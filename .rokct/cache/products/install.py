# Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

import sys
import os


def get_safe_path(base, path):
    abs_base = os.path.abspath(base)
    abs_path = os.path.abspath(os.path.join(base, path))
    if not abs_path.startswith(abs_base):
        raise RuntimeError('Path containment violation')
    return abs_path


sys.path.append(get_safe_path(os.getcwd(), '.rokct'))
import sdk_installer_base

if __name__ == '__main__':
    sdk_name = 'products_sdk'
    sdk_installer_base.install_sdk_files(sdk_name)
